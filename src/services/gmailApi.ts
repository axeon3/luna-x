export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId?: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: string;
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate?: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  isUnread: boolean;
}

export interface GmailAttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}

export interface GmailMessageFull extends GmailMessageSummary {
  cc?: string;
  bodyText: string;
  attachments: GmailAttachmentInfo[];
}

export class GmailAuthExpiredError extends Error {
  constructor(message = 'Gmail access token expired or revoked. Please sign in again.') {
    super(message);
    this.name = 'GmailAuthExpiredError';
  }
}

export class GmailInsufficientScopeError extends Error {
  public readonly requiredScope?: string;

  constructor(
    message = 'Additional Gmail scope permission is required for this operation.',
    requiredScope?: string
  ) {
    super(message);
    this.name = 'GmailInsufficientScopeError';
    this.requiredScope = requiredScope;
  }
}

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function encodeBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function encodeBase64Url(str: string): string {
  return encodeBase64(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeRfc2047Subject(subject: string): string {
  const clean = subject.replace(/[\r\n]+/g, ' ').trim();
  if (/^[\x20-\x7E]*$/.test(clean)) {
    return clean;
  }
  return `=?UTF-8?B?${encodeBase64(clean)}?=`;
}

function buildRawMimeEmail(to: string, subject: string, body: string): string {
  const safeTo = to.replace(/[\r\n]+/g, ' ').trim();
  const safeSubject = encodeRfc2047Subject(subject);
  const encodedBody = encodeBase64(body).replace(/(.{76})/g, '$1\r\n');
  const mime =
    `To: ${safeTo}\r\n` +
    `Subject: ${safeSubject}\r\n` +
    `MIME-Version: 1.0\r\n` +
    `Content-Type: text/plain; charset="UTF-8"\r\n` +
    `Content-Transfer-Encoding: base64\r\n` +
    `\r\n` +
    encodedBody;
  return encodeBase64Url(mime);
}

interface RawGmailPart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: { name?: string; value?: string }[];
  body?: { size?: number; data?: string; attachmentId?: string };
  parts?: RawGmailPart[];
}

function extractHeader(headers: { name?: string; value?: string }[] | undefined, name: string): string {
  if (!headers) return '';
  const target = name.toLowerCase();
  const found = headers.find((h) => (h.name || '').toLowerCase() === target);
  return found?.value || '';
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractMimeContent(part: RawGmailPart | undefined): {
  plain: string[];
  html: string[];
  attachments: GmailAttachmentInfo[];
} {
  const plain: string[] = [];
  const html: string[] = [];
  const attachments: GmailAttachmentInfo[] = [];

  if (!part) return { plain, html, attachments };

  const mime = (part.mimeType || '').toLowerCase();
  if (part.filename && part.filename.trim().length > 0) {
    attachments.push({
      filename: part.filename,
      mimeType: part.mimeType || 'application/octet-stream',
      size: Number(part.body?.size ?? 0),
      attachmentId: part.body?.attachmentId,
    });
  } else if (part.body?.data) {
    try {
      const decoded = decodeBase64Url(part.body.data);
      if (mime === 'text/plain' || mime === '') {
        plain.push(decoded);
      } else if (mime === 'text/html') {
        html.push(decoded);
      }
    } catch {
      // Ignore malformed base64 part
    }
  }

  if (Array.isArray(part.parts)) {
    for (const child of part.parts) {
      const sub = extractMimeContent(child);
      plain.push(...sub.plain);
      html.push(...sub.html);
      attachments.push(...sub.attachments);
    }
  }

  return { plain, html, attachments };
}

async function handleGmailResponse(res: Response, requiredScope?: string): Promise<Response> {
  if (res.status === 401) {
    let msg = 'Gmail access token expired or revoked. Please sign in again.';
    try {
      const body = await res.json();
      if (body?.error?.message) {
        msg = body.error.message;
      }
    } catch {
      // Ignore parse failure
    }
    throw new GmailAuthExpiredError(msg);
  }
  if (res.status === 403) {
    let msg = 'Insufficient Gmail scope permissions for this action.';
    try {
      const body = await res.json();
      if (body?.error?.message) {
        msg = body.error.message;
      }
    } catch {
      // Ignore parse failure
    }
    if (/insufficient|scope|authentication|permission/i.test(msg)) {
      throw new GmailInsufficientScopeError(msg, requiredScope);
    }
    throw new Error(msg);
  }
  if (!res.ok) {
    let detail = `Gmail API error (${res.status})`;
    try {
      const errBody = await res.json();
      if (errBody?.error?.message) {
        detail = errBody.error.message;
      }
    } catch {
      // Ignore parse failure
    }
    throw new Error(detail);
  }
  return res;
}

export async function fetchGmailProfile(token: string): Promise<GmailProfile> {
  const res = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.readonly');
  return (await res.json()) as GmailProfile;
}

export async function listGmailLabels(token: string): Promise<GmailLabel[]> {
  const res = await fetch(`${GMAIL_API_BASE}/labels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.readonly');
  const data = (await res.json()) as { labels?: GmailLabel[] };
  return data.labels || [];
}

export async function listGmailMessages(
  token: string,
  options: { q?: string; labelIds?: string[]; maxResults?: number; pageToken?: string } = {}
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate?: number }> {
  const { q = '', labelIds = [], maxResults = 15, pageToken } = options;

  const params = new URLSearchParams({
    maxResults: String(maxResults),
  });
  if (q.trim()) {
    params.set('q', q.trim());
  }
  for (const lid of labelIds) {
    params.append('labelIds', lid);
  }
  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const listRes = await fetch(`${GMAIL_API_BASE}/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleGmailResponse(listRes, 'https://www.googleapis.com/auth/gmail.readonly');
  const listJson = (await listRes.json()) as {
    messages?: { id: string; threadId: string }[];
    nextPageToken?: string;
    resultSizeEstimate?: number;
  };

  const rawRefs = listJson.messages || [];
  if (rawRefs.length === 0) {
    return {
      messages: [],
      nextPageToken: listJson.nextPageToken,
      resultSizeEstimate: listJson.resultSizeEstimate ?? 0,
    };
  }

  const summaries = await Promise.all(
    rawRefs.map(async (ref) => {
      const msgParams = new URLSearchParams({
        format: 'metadata',
      });
      for (const h of ['Subject', 'From', 'To', 'Date']) {
        msgParams.append('metadataHeaders', h);
      }
      const res = await fetch(
        `${GMAIL_API_BASE}/messages/${encodeURIComponent(ref.id)}?${msgParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.readonly');
      const msg = (await res.json()) as {
        id: string;
        threadId: string;
        labelIds?: string[];
        snippet?: string;
        internalDate?: string;
        payload?: { headers?: { name?: string; value?: string }[] };
      };
      const labels = msg.labelIds || [];
      const headers = msg.payload?.headers;
      return {
        id: msg.id,
        threadId: msg.threadId,
        labelIds: labels,
        snippet: msg.snippet || '',
        internalDate: msg.internalDate,
        subject: extractHeader(headers, 'Subject') || '(No subject)',
        from: extractHeader(headers, 'From') || '(Unknown sender)',
        to: extractHeader(headers, 'To') || '',
        date: extractHeader(headers, 'Date') || '',
        isUnread: labels.includes('UNREAD'),
      } satisfies GmailMessageSummary;
    })
  );

  return {
    messages: summaries,
    nextPageToken: listJson.nextPageToken,
    resultSizeEstimate: listJson.resultSizeEstimate,
  };
}

export async function getGmailMessageFull(
  token: string,
  messageId: string
): Promise<GmailMessageFull> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}?format=full`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.readonly');
  const msg = (await res.json()) as {
    id: string;
    threadId: string;
    labelIds?: string[];
    snippet?: string;
    internalDate?: string;
    payload?: RawGmailPart;
  };
  const labels = msg.labelIds || [];
  const headers = msg.payload?.headers;
  const extracted = extractMimeContent(msg.payload);

  const bodyText =
    extracted.plain.length > 0
      ? extracted.plain.join('\n\n')
      : extracted.html.length > 0
      ? stripHtmlTags(extracted.html.join('\n\n'))
      : msg.snippet || '[Empty message body]';

  return {
    id: msg.id,
    threadId: msg.threadId,
    labelIds: labels,
    snippet: msg.snippet || '',
    internalDate: msg.internalDate,
    subject: extractHeader(headers, 'Subject') || '(No subject)',
    from: extractHeader(headers, 'From') || '(Unknown sender)',
    to: extractHeader(headers, 'To') || '',
    cc: extractHeader(headers, 'Cc') || undefined,
    date: extractHeader(headers, 'Date') || '',
    isUnread: labels.includes('UNREAD'),
    bodyText,
    attachments: extracted.attachments,
  };
}

export async function sendGmailMessage(
  token: string,
  options: { to: string; subject: string; body: string }
): Promise<{ id: string; threadId: string; labelIds?: string[] }> {
  const raw = buildRawMimeEmail(options.to, options.subject, options.body);
  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.send');
  return (await res.json()) as { id: string; threadId: string; labelIds?: string[] };
}

export async function createGmailDraft(
  token: string,
  options: { to: string; subject: string; body: string }
): Promise<{ id: string; message: { id: string } }> {
  const raw = buildRawMimeEmail(options.to, options.subject, options.body);
  const res = await fetch(`${GMAIL_API_BASE}/drafts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: { raw } }),
  });
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.compose');
  return (await res.json()) as { id: string; message: { id: string } };
}

export async function modifyGmailMessageLabels(
  token: string,
  messageId: string,
  options: { addLabelIds?: string[]; removeLabelIds?: string[] }
): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds: options.addLabelIds || [],
        removeLabelIds: options.removeLabelIds || [],
      }),
    }
  );
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.modify');
}

export async function trashGmailMessage(token: string, messageId: string): Promise<void> {
  const res = await fetch(
    `${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}/trash`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  await handleGmailResponse(res, 'https://www.googleapis.com/auth/gmail.modify');
}

export async function deleteGmailMessagePermanently(
  token: string,
  messageId: string
): Promise<void> {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleGmailResponse(res, 'https://mail.google.com/');
}
