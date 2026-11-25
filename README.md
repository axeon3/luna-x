<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Team Axe — NASA Space Apps Challenge 2026 | Credits &amp; Cited Sources</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
  <style>
    :root {
      --bg-crust: #11111b;
      --bg-base: #181825;
      --bg-surface: #1e1e2e;
      --bg-overlay: #242538;
      --border-subtle: #313244;
      --text-primary: #cdd6f4;
      --text-secondary: #a6adc8;
      --accent-blue: #89b4fa;
      --accent-mauve: #cba6f7;
      --accent-green: #a6e3a1;
      --accent-peach: #fab387;
      --accent-teal: #94e2d5;
      --accent-yellow: #f9e2af;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-base);
      color: var(--text-primary);
      min-height: 100vh;
    }
    code, pre, .font-mono {
      font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .card-surface {
      background-color: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    }
    .card-surface:hover {
      border-color: var(--accent-blue);
      box-shadow: 0 10px 26px -12px rgba(137, 180, 250, 0.22);
    }
    .nav-pill {
      background-color: var(--bg-surface);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      transition: all 0.15s ease;
    }
    .nav-pill:hover {
      border-color: var(--accent-blue);
      color: var(--text-primary);
      background-color: var(--bg-overlay);
    }
    .section-anchor {
      scroll-margin-top: 5rem;
    }
    #toast {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    /* Hide scrollbar for horizontal pill nav on mobile */
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="antialiased selection:bg-[#89b4fa]/30 selection:text-[#cdd6f4]">

  <!-- Sticky Top Navigation Bar -->
  <nav class="sticky top-0 z-40 bg-[#181825]/90 backdrop-blur-md border-b border-[#313244]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-xs font-medium w-full">
        <a href="#sec-1" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">1. Featured</a>
        <a href="#sec-2" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">2. Space Apps</a>
        <a href="#sec-3" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">3. NASA Data</a>
        <a href="#sec-4" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">4. Engineering</a>
        <a href="#sec-5" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">5. Platforms</a>
        <a href="#sec-6" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">6. Recognition</a>
        <a href="#sec-7" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">7. Community</a>
        <a href="#sec-8" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">8. Deliverables</a>
        <a href="#sec-9" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">9. Team</a>
        <a href="#sec-10" class="nav-pill px-3 py-1.5 rounded-lg whitespace-nowrap">10. Reflections</a>
      </div>
    </div>
  </nav>

  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">

    <!-- Hero Header -->
    <header class="card-surface rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none opacity-20"
           style="background: radial-gradient(circle at 85% 15%, #89b4fa 0%, transparent 45%), radial-gradient(circle at 15% 85%, #cba6f7 0%, transparent 45%);"></div>

      <div class="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div class="space-y-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30">
              <i data-lucide="moon" class="w-3.5 h-3.5"></i>
              NASA Space Apps Challenge 2026
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">
              Team Axe · San José
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[#cdd6f4]">
            Lunar Landing Site Navigator
          </h1>
          <p class="text-sm sm:text-base text-[#a6adc8] font-medium">
            Credits, Acknowledgments &amp; Cited Sources (10-Section Directory)
          </p>
          <p class="text-xs sm:text-sm text-[#a6adc8] max-w-3xl leading-relaxed">
            Mission credits, NASA Space Apps Challenge organizers, planetary ephemeris &amp; lunar topography APIs, technical stack citations, and project deliverables for
            <a href="https://github.com/teamaxe/Luna-X" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">teamaxe/Luna-X</a>
            and
            <a href="https://github.com/teamaxe/lunar" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">teamaxe/lunar</a>.
          </p>
        </div>

        <!-- Quick Search & Export Controls -->
        <div class="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
          <div class="relative">
            <i data-lucide="search" class="w-4 h-4 text-[#a6adc8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            <input id="filterInput" type="text" placeholder="Search credits, APIs, links..."
                   class="w-full sm:w-64 pl-9 pr-8 py-2 rounded-xl bg-[#11111b] border border-[#313244] text-xs sm:text-sm text-[#cdd6f4] placeholder-[#6c7086] focus:outline-none focus:border-[#89b4fa] transition" />
            <button id="clearFilterBtn" type="button" aria-label="Clear filter"
                    class="hidden absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer p-1">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="flex items-center gap-2">
            <button id="copyAllLinksBtn" type="button"
                    class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-[#11111b] hover:bg-[#242538] text-[#cdd6f4] border border-[#313244] hover:border-[#cba6f7] transition cursor-pointer">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-[#cba6f7]"></i>
              <span>Copy All URLs</span>
            </button>
            <a href="https://www.spaceappschallenge.org/2026/find-a-team/axe/?tab=project" target="_blank" rel="noopener noreferrer"
               class="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#89b4fa] text-[#11111b] hover:opacity-90 transition">
              <span>Project Page</span>
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Empty Search State -->
    <div id="emptySearchState" class="hidden card-surface rounded-2xl p-8 text-center space-y-3">
      <i data-lucide="search-x" class="w-8 h-8 text-[#a6adc8] mx-auto"></i>
      <p class="text-sm font-medium text-[#cdd6f4]">No matching credits, APIs, or citations found.</p>
      <button id="resetSearchBtn" type="button"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#89b4fa] text-[#11111b] hover:opacity-90 transition cursor-pointer">
        Clear Search Filter
      </button>
    </div>

    <!-- ======================================================================= -->
    <!-- 1. Featured Group — Directorate Sponsors, VTA, Space Apps, NASA & Google -->
    <!-- ======================================================================= -->
    <section id="sec-1" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center justify-between border-b border-[#313244] pb-2.5">
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">01</span>
          <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Featured Group — NASA Directorate Sponsors, VTA, Space Apps &amp; Google</h2>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- NASA Directorate Sponsors FIRST -->
        <article class="card-surface rounded-2xl p-5 border-[#89b4fa]/40 space-y-2.5 searchable-item md:col-span-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#89b4fa]/40 flex items-center justify-center shrink-0">
                <i data-lucide="orbit" class="w-5 h-5 text-[#89b4fa]"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-[#cdd6f4]">NASA Directorate Sponsors</h3>
                <p class="text-xs text-[#a6adc8]">Primary Mission Directorates &amp; Science Divisions</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <a href="https://science.nasa.gov/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">science.nasa.gov</a>
              <a href="https://www.nasa.gov/directorates/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">nasa.gov/directorates</a>
            </div>
          </div>
          <ul class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs sm:text-sm text-[#cdd6f4]/90">
            <li class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244]">NASA Earth Science Division (ESD) &amp; Science Mission Directorate (SMD)</li>
            <li class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244]">NASA Space Technology Mission Directorate (STMD) &amp; Exploration Systems Development (ESDMD)</li>
            <li class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244]">NASA Heliophysics &amp; Planetary Science Divisions</li>
          </ul>
        </article>

        <!-- VTA -->
        <article class="card-surface rounded-2xl p-5 border-[#a6e3a1]/40 searchable-item md:col-span-2">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#a6e3a1]/40 flex items-center justify-center shrink-0">
                <i data-lucide="bus" class="w-5 h-5 text-[#a6e3a1]"></i>
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-base font-bold text-[#cdd6f4]">Santa Clara Valley Transportation Authority (VTA)</h3>
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">Featured Community Lifeline</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                  <a href="https://www.vta.org/" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-[#89b4fa] hover:underline">https://www.vta.org/</a>
                  <button type="button" data-copy="https://www.vta.org/" aria-label="Copy VTA URL" class="copy-btn p-1 rounded hover:bg-[#242538] text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer">
                    <i data-lucide="copy" class="w-3 h-3"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <blockquote class="mt-3.5 pl-3.5 border-l-2 border-[#a6e3a1] text-sm text-[#cdd6f4]/90 italic leading-relaxed">
            “More than drivers to us; sometimes they were the only shed of light when things got dark and hopeless, keeping public transit moving and connecting our local communities.”
          </blockquote>
        </article>

        <!-- Space Apps Team & GO Team -->
        <article class="card-surface rounded-2xl p-5 searchable-item">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#313244] flex items-center justify-center shrink-0">
              <i data-lucide="globe" class="w-5 h-5 text-[#89b4fa]"></i>
            </div>
            <h3 class="text-base font-semibold text-[#cdd6f4]">Space Apps Team &amp; Global Organizing (GO) Team</h3>
          </div>
          <div class="flex flex-col gap-1.5 text-xs font-mono">
            <div class="flex items-center justify-between gap-2">
              <a href="https://www.spaceappschallenge.org/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline truncate">https://www.spaceappschallenge.org/</a>
              <button type="button" data-copy="https://www.spaceappschallenge.org/" class="copy-btn p-1 rounded hover:bg-[#242538] text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer shrink-0">
                <i data-lucide="copy" class="w-3 h-3"></i>
              </button>
            </div>
            <div class="flex items-center justify-between gap-2">
              <a href="https://www.spaceappschallenge.org/contact-us/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline truncate">https://www.spaceappschallenge.org/contact-us/</a>
              <button type="button" data-copy="https://www.spaceappschallenge.org/contact-us/" class="copy-btn p-1 rounded hover:bg-[#242538] text-[#a6adc8] hover:text-[#cdd6f4] cursor-pointer shrink-0">
                <i data-lucide="copy" class="w-3 h-3"></i>
              </button>
            </div>
          </div>
        </article>

        <!-- NASA -->
        <article class="card-surface rounded-2xl p-5 searchable-item">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#313244] flex items-center justify-center shrink-0">
              <i data-lucide="rocket" class="w-5 h-5 text-[#94e2d5]"></i>
            </div>
            <h3 class="text-base font-semibold text-[#cdd6f4]">NASA (National Aeronautics and Space Administration)</h3>
          </div>
          <div class="flex flex-wrap gap-2 text-xs font-mono">
            <a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">nasa.gov</a>
            <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">api.nasa.gov</a>
            <a href="https://data.nasa.gov/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">data.nasa.gov</a>
          </div>
        </article>

        <!-- Google -->
        <article class="card-surface rounded-2xl p-5 searchable-item md:col-span-2">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#313244] flex items-center justify-center shrink-0">
                <i data-lucide="sparkles" class="w-5 h-5 text-[#cba6f7]"></i>
              </div>
              <div>
                <h3 class="text-base font-semibold text-[#cdd6f4]">Google (Gemini, Google AI Studio, Google DeepMind &amp; 2026 Global Collaborator)</h3>
                <p class="text-xs text-[#a6adc8]">AI research, multi-agent coordination, and cloud infrastructure</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 text-xs font-mono">
              <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">gemini.google.com</a>
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">aistudio.google.com</a>
              <a href="https://deepmind.google/" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa]">deepmind.google</a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 2. NASA Space Apps Challenge 2026                                       -->
    <!-- ======================================================================= -->
    <section id="sec-2" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30">02</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">NASA Space Apps Challenge 2026 — GO Team, Local Event &amp; Partners</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="card-surface rounded-2xl p-5 space-y-2.5 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#89b4fa]">Global Organizing (GO) Team &amp; Support Staff</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            Thank you to the entire NASA Space Apps GO Team (funded by NASA's Science Mission Directorate via Booz Allen Hamilton, Mindgrub, and SecondMuse) and all event, technical, operational, and community support staff supporting builders worldwide.
          </p>
          <div class="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
            <a href="https://www.spaceappschallenge.org/contact-us/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">spaceappschallenge.org/contact-us</a>
            <button type="button" data-copy="info@spaceappschallenge.org" class="copy-btn inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#cdd6f4] hover:border-[#89b4fa] cursor-pointer">
              <span>info@spaceappschallenge.org</span>
              <i data-lucide="copy" class="w-3 h-3 text-[#89b4fa]"></i>
            </button>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2.5 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#cba6f7]">San José Local Event (Nov 14–15, 2026)</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            <strong class="text-[#cdd6f4]">Catherine (@cathoryn, San José Local Event Lead)</strong> &amp; San José Local Event Organizers, Support Staff, Mentors, Judges &amp; Volunteers.
          </p>
          <div class="pt-1 flex flex-wrap items-center gap-3 text-xs font-mono">
            <a href="https://www.spaceappschallenge.org/2026/local-events/san-jose-ca/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">2026/local-events/san-jose-ca/</a>
            <span class="px-2.5 py-1 rounded-lg bg-[#11111b] border border-[#313244] text-[#a6adc8]">Contact via Local Event Portal</span>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2.5 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#94e2d5]">Partners &amp; Collaborators</h3>
          <ul class="space-y-1.5 text-xs sm:text-sm text-[#a6adc8]">
            <li><strong class="text-[#cdd6f4]">2026 Global Collaborators:</strong> GoDaddy, Google, Meteomatics, Microsoft, Miro (<a href="https://www.spaceappschallenge.org/2026/" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-[#89b4fa] hover:underline">2026 Portal</a>)</li>
            <li><strong class="text-[#cdd6f4]">2026 Space Agency Partners:</strong> ISRO, ESA, JAXA, CSA, UK Space Agency, and 17 global space agency partners (<a href="https://www.spaceappschallenge.org/2026/space-agency-partners/" target="_blank" rel="noopener noreferrer" class="font-mono text-xs text-[#89b4fa] hover:underline">Partners</a>)</li>
          </ul>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2.5 searchable-item md:col-span-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#fab387]">Challenge #10 (CLPS) &amp; Program Links</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
            <a href="https://www.spaceappschallenge.org/2026/challenges/lunar-landing-site-navigator/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">10 - CLPS: Lunar Navigator</a>
            <a href="https://www.spaceappschallenge.org/2026/challenges/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">2026 Challenges Index</a>
            <a href="https://www.nasaspaceappschallenge.org/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">nasaspaceappschallenge.org</a>
            <a href="https://www.spaceappschallenge.org/2026/local-events/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">2026 Local Events</a>
            <a href="https://www.spaceappschallenge.org/2026/find-a-team/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">2026 Find a Team</a>
            <a href="https://www.spaceappschallenge.org/resources/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">Resources Hub</a>
            <a href="https://www.spaceappschallenge.org/resources/team-formation-guide/" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-xl bg-[#11111b] border border-[#313244] text-[#89b4fa] hover:border-[#89b4fa] truncate">Team Formation Guide</a>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 3. NASA APIs, Planetary Ephemeris & Lunar Data Sources                  -->
    <!-- ======================================================================= -->
    <section id="sec-3" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#94e2d5]/15 text-[#94e2d5] border border-[#94e2d5]/30">03</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">NASA APIs, Planetary Ephemeris &amp; Lunar Data Sources</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Core NASA API & Data Portals -->
        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#94e2d5]">Core NASA API &amp; Data Portals</h3>
          <ul class="space-y-2 text-xs">
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">NASA Open APIs Portal</span>
              <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">api.nasa.gov</a>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">Updated APOD API Endpoint</span>
              <a href="https://science.nasa.gov/wp-json/wp/v2/apod-basic" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">apod-basic</a>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">NASA Open Data Portal</span>
              <span class="font-mono space-x-2">
                <a href="https://data.nasa.gov/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">data.nasa.gov</a>
                <a href="https://data.nasa.gov/dataset/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">/dataset</a>
              </span>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">NASA Image and Video Library</span>
              <a href="https://images.nasa.gov/" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">images.nasa.gov</a>
            </li>
          </ul>
        </article>

        <!-- Lunar Topography & Thermal Ground Truth -->
        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#94e2d5]">Lunar Topography &amp; Thermal Ground Truth</h3>
          <ul class="space-y-2 text-xs">
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">NASA PDS Geosciences — LRO LOLA Data</span>
              <a href="https://pds-geosciences.wustl.edu/missions/lro/lola.htm" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">lola.htm</a>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">NASA PDS Geosciences — LRO &amp; Moon Archives</span>
              <span class="font-mono space-x-2">
                <a href="https://pds-geosciences.wustl.edu/missions/lro/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">/lro</a>
                <a href="https://pds-geosciences.wustl.edu/dataserv/moon.html" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">moon.html</a>
              </span>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">USGS Astrogeology — LRO LOLA DEM 118m</span>
              <a href="https://astrogeology.usgs.gov/search/map/moon_lro_lola_dem_118m" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">dem_118m</a>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">USGS Astrogeology STAC API &amp; NASA PGDA 95</span>
              <span class="font-mono space-x-2">
                <a href="https://stac.astrogeology.usgs.gov/api/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">STAC API</a>
                <a href="https://pgda.gsfc.nasa.gov/products/95" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">PGDA 95</a>
              </span>
            </li>
            <li class="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">ASU LROC Quickmap (Challenge #10 Resource)</span>
              <a href="https://quickmap.lroc.asu.edu/" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">quickmap.lroc.asu.edu</a>
            </li>
          </ul>
        </article>

        <!-- Planetary, Lunar & JPL Ephemeris APIs -->
        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item lg:col-span-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#94e2d5]">Planetary, Lunar &amp; JPL Ephemeris APIs</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <a href="https://ssd-api.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL SSD/CNEOS API Service</span>
              <span class="font-mono text-[#89b4fa]">ssd-api.jpl.nasa.gov</span>
            </a>
            <a href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL Horizons On-Line Ephemeris System</span>
              <span class="font-mono text-[#89b4fa]">ssd.jpl.nasa.gov/horizons</span>
            </a>
            <a href="https://ssd-api.jpl.nasa.gov/doc/horizons.html" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL Horizons REST API</span>
              <span class="font-mono text-[#89b4fa]">doc/horizons.html</span>
            </a>
            <a href="https://ssd-api.jpl.nasa.gov/doc/horizons_file.html" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL Horizons File API</span>
              <span class="font-mono text-[#89b4fa]">doc/horizons_file.html</span>
            </a>
            <a href="https://ssd-api.jpl.nasa.gov/doc/horizons_lookup.html" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL Horizons Lookup API</span>
              <span class="font-mono text-[#89b4fa]">doc/horizons_lookup.html</span>
            </a>
            <a href="https://ssd-api.jpl.nasa.gov/doc/sbdb.html" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">JPL SBDB (Small-Body DataBase) API</span>
              <span class="font-mono text-[#89b4fa]">doc/sbdb.html</span>
            </a>
            <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">NASA Solar System Treks &amp; Moon Trek</span>
              <span class="font-mono text-[#89b4fa]">trek.nasa.gov/moon</span>
            </a>
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">Moon Trek WMTS API Index &amp; Docs</span>
              <span class="font-mono space-x-2">
                <a href="https://trek.nasa.gov/tiles/apidoc/index.html" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Index</a>
                <a href="https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=moon" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Docs</a>
              </span>
            </div>
            <a href="https://ssd.jpl.nasa.gov/doc/de440_de441.html" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">NASA/JPL Planetary Ephemerides DE440/441</span>
              <span class="font-mono text-[#89b4fa]">de440_de441.html</span>
            </a>
            <a href="https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa]">
              <span class="text-[#cdd6f4]">NASA NAIF Generic Planetary SPK Kernels</span>
              <span class="font-mono text-[#89b4fa]">naif.jpl.nasa.gov</span>
            </a>
          </div>
        </article>

        <!-- Earth Science & Satellite Imagery APIs -->
        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item lg:col-span-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#94e2d5]">Earth Science &amp; Satellite Imagery APIs</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <a href="https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa] flex flex-col gap-1">
              <span class="text-[#cdd6f4] font-medium">Earthdata GIBS API</span>
              <span class="font-mono text-[#89b4fa] truncate">earthdata.nasa.gov/.../gibs-api</span>
            </a>
            <a href="https://cmr.earthdata.nasa.gov/search/site/docs/search/api" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa] flex flex-col gap-1">
              <span class="text-[#cdd6f4] font-medium">Earthdata CMR Search API</span>
              <span class="font-mono text-[#89b4fa] truncate">cmr.earthdata.nasa.gov/search</span>
            </a>
            <a href="https://cmr.earthdata.nasa.gov/stac/docs/index.html" target="_blank" rel="noopener noreferrer" class="p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#89b4fa] flex flex-col gap-1">
              <span class="text-[#cdd6f4] font-medium">Earthdata CMR STAC API</span>
              <span class="font-mono text-[#89b4fa] truncate">cmr.earthdata.nasa.gov/stac</span>
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 4. Scientific Computing, Geospatial & Frontend Stack Citations          -->
    <!-- ======================================================================= -->
    <section id="sec-4" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/30">04</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Scientific Computing, Geospatial &amp; Frontend Stack Citations</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#cba6f7]">Geospatial &amp; Lunar Terrain Processing (Python)</h3>
          <div class="space-y-2 text-xs">
            <a href="https://rasterio.readthedocs.io/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">Rasterio (Geospatial Raster I/O)</span>
              <span class="font-mono text-[#89b4fa]">rasterio.readthedocs.io</span>
            </a>
            <a href="https://numpy.org/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">NumPy (Numerical Array Computing)</span>
              <span class="font-mono text-[#89b4fa]">numpy.org</span>
            </a>
            <a href="https://pyproj4.github.io/pyproj/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">PyProj (Cartographic Projections &amp; CRS)</span>
              <span class="font-mono text-[#89b4fa]">pyproj4.github.io/pyproj</span>
            </a>
            <a href="https://spiceypy.readthedocs.io/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">SpiceyPy (NASA NAIF SPICE Toolkit)</span>
              <span class="font-mono text-[#89b4fa]">spiceypy.readthedocs.io</span>
            </a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-3 searchable-item">
          <h3 class="text-sm font-semibold uppercase tracking-wider text-[#cba6f7]">Web Application, 3D Visualization &amp; Cloud Infrastructure</h3>
          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">React &amp; TypeScript</span>
              <span class="font-mono space-x-2">
                <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">react.dev</a>
                <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">typescriptlang.org</a>
              </span>
            </div>
            <a href="https://vite.dev/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">Vite Build Tool</span>
              <span class="font-mono text-[#89b4fa]">vite.dev</span>
            </a>
            <a href="https://threejs.org/" target="_blank" rel="noopener noreferrer" class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244] hover:border-[#cba6f7]">
              <span class="text-[#cdd6f4] font-medium">Three.js / WebGL Lunar Visualization</span>
              <span class="font-mono text-[#89b4fa]">threejs.org</span>
            </a>
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">Tailwind CSS &amp; Lucide Icons</span>
              <span class="font-mono space-x-2">
                <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">tailwindcss</a>
                <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">lucide.dev</a>
              </span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-[#11111b] border border-[#313244]">
              <span class="text-[#cdd6f4] font-medium">Google Cloud Run &amp; Firebase Hosting</span>
              <span class="font-mono space-x-2">
                <a href="https://cloud.google.com/run" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Cloud Run</a>
                <a href="https://firebase.google.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Firebase</a>
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 5. Platforms, AI Research & Browser Acknowledgments                     -->
    <!-- ======================================================================= -->
    <section id="sec-5" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30">05</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Platforms, AI Research &amp; Browser Acknowledgments</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Gemini &amp; Google AI Studio</h3>
          <p class="text-[#a6adc8]">Gemini, Gemini for Research (Google AI Studio), and Gemini Deep Research</p>
          <div class="flex flex-col gap-1 font-mono pt-1">
            <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">gemini.google.com</a>
            <a href="https://aistudio.google.com/docs/gemini-for-research" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">aistudio.google.com/docs/gemini-for-research</a>
            <a href="https://aistudio.google.com/docs/deep-research" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">aistudio.google.com/docs/deep-research</a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Google DeepMind &amp; Open Research</h3>
          <p class="text-[#a6adc8]">Google DeepMind, DeepMind Publications, Gemini Models, Google Support &amp; Community, Google Dataset Search, Google Scholar, Google Cloud Public Datasets &amp; Google Workspace</p>
          <div class="flex flex-col gap-1 font-mono pt-1">
            <a href="https://deepmind.google/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">deepmind.google</a>
            <a href="https://deepmind.google/research/publications/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">deepmind.google/research/publications</a>
            <a href="https://deepmind.google/models/gemini/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">deepmind.google/models/gemini</a>
            <a href="https://support.google.com/gemini/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">support.google.com/gemini</a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Mozilla &amp; Firefox</h3>
          <p class="text-[#a6adc8]">Mozilla, Firefox Browser, Firefox for Android, Mozilla Support, and Mozilla Community Hub</p>
          <div class="flex flex-wrap gap-2 font-mono pt-1">
            <a href="https://www.mozilla.org/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">mozilla.org</a>
            <a href="https://www.firefox.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">firefox.com</a>
            <a href="https://www.firefox.com/download/android/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Android</a>
            <a href="https://support.mozilla.org/en-US/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Support</a>
            <a href="https://support.mozilla.org/community/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">Community</a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Android Team</h3>
          <p class="text-[#a6adc8]">Mobile platform support &amp; field testing</p>
          <div class="font-mono pt-1">
            <a href="https://www.android.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">android.com</a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">GitHub (teamaxe)</h3>
          <p class="text-[#a6adc8]">Version control, GitHub Actions CI/CD &amp; GitHub Pages hosting</p>
          <div class="flex flex-col gap-1 font-mono pt-1">
            <a href="https://github.com/teamaxe/Luna-X" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">github.com/teamaxe/Luna-X</a>
            <a href="https://github.com/teamaxe/lunar" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">github.com/teamaxe/lunar</a>
          </div>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-2 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">WhatsApp</h3>
          <p class="text-[#a6adc8]">Real-time team messaging and engineering coordination</p>
          <div class="font-mono pt-1">
            <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer" class="text-[#89b4fa] hover:underline">whatsapp.com</a>
          </div>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 6. Service & Civic Infrastructure Recognition                           -->
    <!-- ======================================================================= -->
    <section id="sec-6" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#fab387]/15 text-[#fab387] border border-[#fab387]/30">06</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Service &amp; Civic Infrastructure Recognition</h2>
      </div>

      <div class="card-surface rounded-2xl p-5 sm:p-6 space-y-5">
        <p class="text-xs sm:text-sm text-[#cdd6f4]/90 leading-relaxed bg-[#11111b] p-4 rounded-xl border border-[#313244]">
          We express our deepest gratitude and recognition to the men and women currently serving and who have served—both in uniform and across public and community service—whose unwavering dedication, sacrifice, and continued support safeguard the foundational environment that enables open scientific exploration, public service, and collaborative innovation worldwide.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-2 searchable-item">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#fab387]">Emergency Response &amp; Public Safety</h3>
            <ul class="space-y-1.5 text-xs text-[#a6adc8] list-disc list-inside">
              <li><strong class="text-[#cdd6f4]">San José Police Department (SJPD)</strong> — Maintaining public safety and serving our neighborhoods.</li>
              <li><strong class="text-[#cdd6f4]">San José Fire Department (SJFD) &amp; EMTs</strong> — Providing life-saving emergency medical response, paramedic care, rescue operations, and fire protection.</li>
              <li><strong class="text-[#cdd6f4]">Santa Clara County EMS &amp; First Responders</strong> — Supporting pre-hospital emergency care and rapid medical response across the county.</li>
              <li><strong class="text-[#cdd6f4]">Santa Clara County Office of Emergency Management</strong> — Coordinating region-wide disaster preparedness and emergency response operations.</li>
            </ul>
          </div>

          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-2 searchable-item">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#fab387]">Social Workers, Public Health &amp; Human Services</h3>
            <ul class="space-y-1.5 text-xs text-[#a6adc8] list-disc list-inside">
              <li><strong class="text-[#cdd6f4]">Santa Clara County Social Services Agency &amp; Social Workers</strong> — Supporting individuals, families, and vulnerable community members with essential care, advocacy, and stability.</li>
              <li><strong class="text-[#cdd6f4]">Public Health &amp; Community Outreach Workers</strong> — Ensuring equitable access to health resources, crisis support, and community well-being.</li>
            </ul>
          </div>

          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-2 searchable-item">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[#fab387]">Transit, Municipal Operations &amp; Infrastructure</h3>
            <ul class="space-y-1.5 text-xs text-[#a6adc8] list-disc list-inside">
              <li><strong class="text-[#cdd6f4]">Santa Clara Valley Transportation Authority (VTA)</strong> — More than drivers to us; sometimes they were the only shed of light when things got dark and hopeless, keeping public transit moving and connecting our local communities.</li>
              <li><strong class="text-[#cdd6f4]">San José Department of Transportation (DOT)</strong> — Managing city roadway infrastructure, traffic engineering, and mobility safety.</li>
              <li><strong class="text-[#cdd6f4]">San José Environmental Services Department (ESD)</strong> — Preserving clean water, recycling, waste management, and sustainability.</li>
              <li><strong class="text-[#cdd6f4]">San José Public Works</strong> — Maintaining vital civic facilities and public infrastructure.</li>
              <li><strong class="text-[#cdd6f4]">San José Water &amp; Municipal Utilities</strong> — Ensuring reliable water and essential utility services.</li>
              <li><strong class="text-[#cdd6f4]">San José Public Library (SJPL) &amp; Parks, Recreation and Neighborhood Services (PRNS)</strong> — Fostering learning spaces, public technology access, and resilient community spaces.</li>
              <li><strong class="text-[#cdd6f4]">All Public Servants, Civic Employees &amp; Support Staff</strong> — Every municipal, county, state, federal, and venue support staff member keeping communities and events running safely, cleanly, and smoothly.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 7. Personal, Household & Neighborhood Community Support                 -->
    <!-- ======================================================================= -->
    <section id="sec-7" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#a6e3a1]/15 text-[#a6e3a1] border border-[#a6e3a1]/30">07</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Personal, Household &amp; Neighborhood Community Support</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="card-surface rounded-2xl p-5 space-y-1.5 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Roommates, Landlord, Family &amp; Friends</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            For ongoing support, patience, hospitality, and daily encouragement.
          </p>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-1.5 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Neighbors &amp; Surrounding Local Community</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            For being supportive, welcoming neighbors and fostering a strong, resilient local community.
          </p>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-1.5 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Friends We Didn't Know We Had</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            We may not know their names, we just feel they are looking after us—to the unexpected allies, kind strangers, and quiet helpers whose unseen goodwill and support showed up right when it mattered most.
          </p>
        </article>

        <article class="card-surface rounded-2xl p-5 space-y-1.5 searchable-item">
          <h3 class="text-sm font-semibold text-[#cdd6f4]">Confidential Friends &amp; Supporters</h3>
          <p class="text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
            Those who remain unnamed out of respect for anonymity and confidentiality, whose encouragement and support helped make this work possible.
          </p>
        </article>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 8. Project Documentation & Deliverables                                 -->
    <!-- ======================================================================= -->
    <section id="sec-8" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#89b4fa]/15 text-[#89b4fa] border border-[#89b4fa]/30">08</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Project Documentation &amp; Deliverables</h2>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-[#313244] bg-[#1e1e2e]">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-[#313244] text-[#a6adc8] bg-[#11111b]/60">
              <th class="py-3.5 px-4 font-semibold">Deliverable Name</th>
              <th class="py-3.5 px-4 font-semibold">Format / Platform</th>
              <th class="py-3.5 px-4 font-semibold text-right">Resource Link</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#313244]">
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">LUNA-X Documentation</td>
              <td class="py-3 px-4 text-[#a6adc8]">Google Docs</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://docs.google.com/document/d/1cGaUMiCatlcYqYfnbMZ60ELPyeOt0sCCLiOORopyihM/edit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#89b4fa] hover:underline">
                  <span>Open Doc</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">Comprehensive Wrap-Up</td>
              <td class="py-3 px-4 text-[#a6adc8]">Google Docs</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://docs.google.com/document/d/18CeNYepbv-9dKYKDlKvGwEuJApGe3yiqNHj5f32Immc/edit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#89b4fa] hover:underline">
                  <span>Open Doc</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">Mission Case Study</td>
              <td class="py-3 px-4 text-[#a6adc8]">Google Docs</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://docs.google.com/document/d/1RKwAZztL1ZWAL4fzMiFeHo3q-9UGOXwBX1TyczCivh0/edit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#89b4fa] hover:underline">
                  <span>Open Doc</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">Contacts &amp; Directory</td>
              <td class="py-3 px-4 text-[#a6adc8]">Google Docs</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://docs.google.com/document/d/13KASG-zUXyIw4zTflhBrdQULvWQYbZGHGZKAJES2B8E/edit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#89b4fa] hover:underline">
                  <span>Open Doc</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">Presentation Deck</td>
              <td class="py-3 px-4 text-[#a6adc8]">Google Slides</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://docs.google.com/presentation/d/1MeMGyCZw3GhvjZomodLHBMZVkVDraq944YGxbJ3spGY/edit" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#89b4fa] hover:underline">
                  <span>Open Slides</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
            <tr class="hover:bg-[#242538]/60 searchable-item">
              <td class="py-3 px-4 font-medium text-[#cdd6f4]">Team Axe Official Page</td>
              <td class="py-3 px-4 text-[#a6adc8]">NASA Space Apps Portal</td>
              <td class="py-3 px-4 text-right font-mono text-xs">
                <a href="https://www.spaceappschallenge.org/2026/find-a-team/axe/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[#a6e3a1] hover:underline">
                  <span>Visit Team Page</span><i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 9. Team Axe Credits & Repositories                                      -->
    <!-- ======================================================================= -->
    <section id="sec-9" class="section-anchor space-y-4 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#94e2d5]/15 text-[#94e2d5] border border-[#94e2d5]/30">09</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Team Axe Credits &amp; Repositories</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href="https://www.spaceappschallenge.org/2026/find-a-team/axe/?tab=project" target="_blank" rel="noopener noreferrer"
           class="card-surface rounded-2xl p-5 flex items-center justify-between gap-3 searchable-item">
          <div>
            <div class="text-xs text-[#a6adc8]">NASA Space Apps</div>
            <div class="text-sm sm:text-base font-semibold text-[#cdd6f4] mt-0.5">Project Submission Tab</div>
          </div>
          <i data-lucide="arrow-up-right" class="w-5 h-5 text-[#94e2d5]"></i>
        </a>

        <a href="https://github.com/teamaxe/Luna-X" target="_blank" rel="noopener noreferrer"
           class="card-surface rounded-2xl p-5 flex items-center justify-between gap-3 searchable-item">
          <div>
            <div class="text-xs font-mono text-[#89b4fa]">GitHub Repository</div>
            <div class="text-sm sm:text-base font-semibold text-[#cdd6f4] mt-0.5">teamaxe/Luna-X</div>
          </div>
          <i data-lucide="github" class="w-5 h-5 text-[#89b4fa]"></i>
        </a>

        <a href="https://github.com/teamaxe/lunar" target="_blank" rel="noopener noreferrer"
           class="card-surface rounded-2xl p-5 flex items-center justify-between gap-3 searchable-item">
          <div>
            <div class="text-xs font-mono text-[#cba6f7]">GitHub Repository</div>
            <div class="text-sm sm:text-base font-semibold text-[#cdd6f4] mt-0.5">teamaxe/lunar</div>
          </div>
          <i data-lucide="github" class="w-5 h-5 text-[#cba6f7]"></i>
        </a>
      </div>

      <!-- Core Team Roster -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <a href="https://github.com/axeon3" target="_blank" rel="noopener noreferrer" class="card-surface rounded-xl p-4 flex items-center justify-between searchable-item">
          <span class="font-mono text-sm font-semibold text-[#cdd6f4]">@axeon3</span>
          <span class="text-xs text-[#89b4fa] flex items-center gap-1">GitHub <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>
        </a>
        <a href="https://github.com/gsrini3" target="_blank" rel="noopener noreferrer" class="card-surface rounded-xl p-4 flex items-center justify-between searchable-item">
          <span class="font-mono text-sm font-semibold text-[#cdd6f4]">@gsrini3</span>
          <span class="text-xs text-[#89b4fa] flex items-center gap-1">GitHub <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>
        </a>
        <a href="https://github.com/priyajitpaul275" target="_blank" rel="noopener noreferrer" class="card-surface rounded-xl p-4 flex items-center justify-between searchable-item">
          <span class="font-mono text-sm font-semibold text-[#cdd6f4]">@priyajitpaul275</span>
          <span class="text-xs text-[#89b4fa] flex items-center gap-1">GitHub <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>
        </a>
        <a href="https://github.com/mariamtahir" target="_blank" rel="noopener noreferrer" class="card-surface rounded-xl p-4 flex items-center justify-between searchable-item">
          <span class="font-mono text-sm font-semibold text-[#cdd6f4]">@mariamtahir</span>
          <span class="text-xs text-[#89b4fa] flex items-center gap-1">GitHub <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></span>
        </a>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 10. Team Reflections — Hackathon Journey                                -->
    <!-- ======================================================================= -->
    <section id="sec-10" class="section-anchor space-y-5 searchable-section">
      <div class="flex items-center gap-2.5 border-b border-[#313244] pb-2.5">
        <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/30">10</span>
        <h2 class="text-lg sm:text-xl font-bold text-[#cdd6f4]">Team Reflections — Hackathon Journey</h2>
      </div>

      <!-- Gayathri (@gsrini3) -->
      <article class="card-surface rounded-2xl p-6 space-y-5 searchable-item">
        <div class="flex items-center justify-between gap-3 border-b border-[#313244] pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#89b4fa]/40 flex items-center justify-center font-mono text-sm font-bold text-[#89b4fa]">GS</div>
            <div>
              <h3 class="text-base sm:text-lg font-bold text-[#cdd6f4]">Gayathri (<a href="https://github.com/gsrini3" target="_blank" rel="noopener noreferrer" class="font-mono text-[#89b4fa] hover:underline">@gsrini3</a>)</h3>
              <p class="text-xs text-[#a6adc8]">Hackathon Journey Reflection</p>
            </div>
          </div>
        </div>

        <div class="space-y-4 text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
          <div class="space-y-1.5">
            <h4 class="font-semibold text-[#cdd6f4]">1. What inspired your team to choose this project?</h4>
            <p>We were inspired by the growing momentum of NASA's Commercial Lunar Payload Services (CLPS) program and the exciting prospect of sustained human and robotic exploration of the Moon. We wanted to build something that went beyond simply displaying mission information. Our vision was to create an interactive lunar landing-site navigator that brings together mission data, 3D lunar visualization, terrain analysis, and environmental factors such as sunlight availability and Earth visibility. We wanted to make complex lunar mission information easier to explore while addressing challenges that future lunar missions may encounter.</p>
          </div>

          <div class="space-y-1.5">
            <h4 class="font-semibold text-[#cdd6f4]">2. What did your team learn during the hackathon?</h4>
            <p>We gained valuable experience combining geospatial data processing, scientific computing, and modern web technologies into one application. We learned how NASA's LOLA elevation datasets can be processed into terrain profiles and 360-degree horizon information, and how JPL Horizons data can help analyze Sun and Earth positions relative to lunar landing sites. We also learned the importance of lunar-specific coordinate transformations, integrating multiple data sources, and designing interactive 3D visualizations that make complex scientific information accessible.</p>
          </div>

          <div class="space-y-2">
            <h4 class="font-semibold text-[#cdd6f4]">3. What roadblocks did your team encounter, and how did you overcome them?</h4>
            <p>One of our biggest challenges was bringing together large NASA lunar elevation datasets, external REST APIs, and astronomical calculations into a unified application. LOLA elevation datasets have different resolutions and geographic coverage, and some files are several gigabytes in size. We addressed this by developing a dedicated Python terrain-processing engine using Rasterio, NumPy, and PyProj to process site-specific elevation data and generate 360-degree terrain horizon profiles, which we integrated into the application for terrain-aware analysis.</p>
            <p>Another challenge was integrating NASA/JPL Horizons through its REST API to retrieve accurate Sun and Earth positions relative to specific lunar landing coordinates. We had to handle API query construction, response parsing, coordinate reference frames, request timeouts, and the processing of time-series data. We also explored NASA's NAIF SPICE toolkit through SpiceyPy, which requires the appropriate planetary and lunar kernels to calculate celestial positions locally. Supporting both approaches helped us build flexibility into our ephemeris engine, with an analytical synthetic fallback for testing when live API access or SPICE kernels were unavailable.</p>
            <p>We also faced challenges in connecting scientific computations with the interactive 3D visualization and ensuring that lunar-specific coordinate transformations and terrain calculations were consistent across components. By breaking the system into modular engines, validating calculations independently, and integrating the components incrementally, we overcame these challenges and developed a comprehensive lunar landing-site analysis platform.</p>
          </div>
        </div>
      </article>

      <!-- Mariam (@mariamtahir) -->
      <article class="card-surface rounded-2xl p-6 space-y-4 searchable-item">
        <div class="flex items-center gap-3 border-b border-[#313244] pb-3.5">
          <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#cba6f7]/40 flex items-center justify-center font-mono text-sm font-bold text-[#cba6f7]">MT</div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-[#cdd6f4]">Mariam (<a href="https://github.com/mariamtahir" target="_blank" rel="noopener noreferrer" class="font-mono text-[#cba6f7] hover:underline">@mariamtahir</a>)</h3>
            <p class="text-xs text-[#a6adc8]">Hackathon Reflection</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-1">
            <h4 class="font-semibold text-[#cdd6f4]">About the Project</h4>
            <p>I truly believe our project is one of the strongest and most relevant projects for NASA Space Apps. Out of all the projects I have seen so far, ours stands out for its innovation and real-world impact. Congratulations team, we have created something truly amazing.</p>
          </div>

          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-1">
            <h4 class="font-semibold text-[#cdd6f4]">About the Team</h4>
            <p>This has been one of the most amazing teams I have worked with. Everyone was collaborative and committed throughout the hackathon. There was a slight communication gap at times, but apart from that, everything was exceptional.</p>
          </div>

          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-1">
            <h4 class="font-semibold text-[#cdd6f4]">Team Collaboration &amp; Coordination</h4>
            <p>Axe, you brought strong commitment and effort to the collaboration, helped ensure everyone could contribute their part, and kept the project moving forward with what we needed.</p>
          </div>

          <div class="p-4 rounded-xl bg-[#11111b] border border-[#313244] space-y-1">
            <h4 class="font-semibold text-[#cdd6f4]">One Suggestion</h4>
            <p>Moving forward, it would be even better if we finalize every detail within the hackathon timeline.</p>
          </div>
        </div>
      </article>

      <!-- Priyajit (@priyajitpaul275) -->
      <article class="card-surface rounded-2xl p-6 space-y-4 searchable-item">
        <div class="flex items-center gap-3 border-b border-[#313244] pb-3.5">
          <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#fab387]/40 flex items-center justify-center font-mono text-sm font-bold text-[#fab387]">PP</div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-[#cdd6f4]">Priyajit (<a href="https://github.com/priyajitpaul275" target="_blank" rel="noopener noreferrer" class="font-mono text-[#fab387] hover:underline">@priyajitpaul275</a>)</h3>
            <p class="text-xs text-[#a6adc8]">Hackathon Reflection</p>
          </div>
        </div>

        <div class="space-y-3 text-xs sm:text-sm text-[#a6adc8] leading-relaxed">
          <p>As this hackathon journey comes to an end, I'm grateful for everything it has taught me. From new challenges and countless discussions to teamwork and learning from mistakes, every moment was a valuable experience.</p>
          <p>I may not have known everything at the beginning, but I leave with new skills, meaningful connections, and a better understanding of what it takes to turn an idea into reality.</p>
          <p>Thank you to everyone who was part of this journey. The experience doesn't end here; it's just another step towards bigger things.</p>
        </div>
      </article>

      <!-- Axe (@axeon3) -->
      <article class="card-surface rounded-2xl p-6 border-[#94e2d5]/40 searchable-item">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-[#11111b] border border-[#94e2d5]/40 flex items-center justify-center font-mono text-sm font-bold text-[#94e2d5]">AX</div>
          <div>
            <h3 class="text-base sm:text-lg font-bold text-[#cdd6f4]">Axe (<a href="https://github.com/axeon3" target="_blank" rel="noopener noreferrer" class="font-mono text-[#94e2d5] hover:underline">@axeon3</a>)</h3>
            <p class="text-xs text-[#a6adc8]">Closing Note</p>
          </div>
        </div>
        <blockquote class="pl-4 border-l-2 border-[#94e2d5] text-sm sm:text-base text-[#cdd6f4] italic leading-relaxed">
          “Special thanks to my friends I did not know I had. To those we have and to those we have lost—this is for you. Thanks.” — <span class="not-italic font-semibold text-[#94e2d5]">Axe</span>
        </blockquote>
      </article>
    </section>

    <!-- Footer -->
    <footer class="pt-6 border-t border-[#313244] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a6adc8]">
      <span>Team Axe · NASA Space Apps Challenge 2026 · Lunar Landing Site Navigator</span>
      <span>Catppuccin Mocha (<code class="text-[#89b4fa]">#181825</code>)</span>
    </footer>
  </div>

  <!-- Toast Notification -->
  <div id="toast" role="status" aria-live="polite"
       class="fixed bottom-5 right-5 z-50 pointer-events-none opacity-0 translate-y-2 bg-[#11111b] border border-[#89b4fa]/50 text-[#cdd6f4] px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm flex items-center gap-2">
    <i data-lucide="check-circle-2" class="w-4 h-4 text-[#a6e3a1]"></i>
    <span id="toastMsg">Copied to clipboard</span>
  </div>

  <script>
    if (window.lucide) {
      window.lucide.createIcons();
    }

    let toastTimer = null;
    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMsg').textContent = msg;
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
      }, 2200);
    }

    function copyToClipboard(text, label) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(label);
      } catch (err) {
        showToast('Unable to copy');
      }
      document.body.removeChild(ta);
    }

    // Copy individual URL / email buttons
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.copy;
        copyToClipboard(val, `Copied ${val}`);
      });
    });

    // Copy all external URLs on the page
    document.getElementById('copyAllLinksBtn').addEventListener('click', () => {
      const urls = Array.from(document.querySelectorAll('a[href^="http"]'))
        .map((a) => a.href);
      const unique = [...new Set(urls)];
      copyToClipboard(unique.join('\n'), `Copied ${unique.length} cited URLs`);
    });

    // Live search filter across all 10 sections
    const filterInput = document.getElementById('filterInput');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const emptySearchState = document.getElementById('emptySearchState');

    function applyFilter() {
      const q = filterInput.value.trim().toLowerCase();
      clearFilterBtn.classList.toggle('hidden', q.length === 0);

      let totalVisibleSections = 0;

      document.querySelectorAll('.searchable-section').forEach((section) => {
        const items = section.querySelectorAll('.searchable-item');
        let visibleCount = 0;

        items.forEach((item) => {
          const match = !q || item.textContent.toLowerCase().includes(q);
          item.classList.toggle('hidden', !match);
          if (match) visibleCount++;
        });

        const showSection = visibleCount > 0;
        section.classList.toggle('hidden', !showSection);
        if (showSection) totalVisibleSections++;
      });

      emptySearchState.classList.toggle('hidden', totalVisibleSections > 0);
    }

    filterInput.addEventListener('input', applyFilter);
    clearFilterBtn.addEventListener('click', () => {
      filterInput.value = '';
      applyFilter();
    });
    resetSearchBtn.addEventListener('click', () => {
      filterInput.value = '';
      applyFilter();
    });
  </script>
</body>
</html>
