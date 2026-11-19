import math
import pathlib
import sys
from typing import Sequence

import pint
from hypothesis import given
from hypothesis import strategies as st

ROOT = pathlib.Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from libration_sim import (  # noqa: E402
    DTE_GATE_PCT,
    R_MOON_M,
    SOLAR_GATE_PCT,
    interpolate_horizon_mask,
)


def wrap_azimuth_deg(azimuth_deg: float) -> float:
    """Wrap an azimuth angle in degrees into [0.0, 360.0).

    pre: math.isfinite(azimuth_deg)
    post: 0.0 <= __return__ < 360.0
    """
    wrapped = azimuth_deg % 360.0
    if wrapped >= 360.0 or wrapped == -0.0:
        wrapped = 0.0
    return wrapped


def classify_clps_gate(solar_pct: float, dte_pct: float) -> str:
    """Classify CLPS mission gate from solar and Direct-to-Earth percentages.

    pre: math.isfinite(solar_pct) and math.isfinite(dte_pct)
    pre: 0.0 <= solar_pct <= 100.0 and 0.0 <= dte_pct <= 100.0
    post: __return__ in ("PASS", "SOLAR_FAIL", "DTE_FAIL", "BOTH_FAIL")
    """
    solar_ok = solar_pct >= SOLAR_GATE_PCT
    dte_ok = dte_pct >= DTE_GATE_PCT
    if solar_ok and dte_ok:
        return "PASS"
    if not solar_ok and not dte_ok:
        return "BOTH_FAIL"
    if not solar_ok:
        return "SOLAR_FAIL"
    return "DTE_FAIL"


def checked_interpolate_horizon_mask(
    azimuth_deg: float, mask_deg: Sequence[float]
) -> float:
    """CrossHair-contracted wrapper for interpolate_horizon_mask.

    pre: math.isfinite(azimuth_deg)
    pre: len(mask_deg) > 0 and all(math.isfinite(v) and 0.0 <= v <= 90.0 for v in mask_deg)
    post: min(mask_deg) - 1e-9 <= __return__ <= max(mask_deg) + 1e-9
    """
    return interpolate_horizon_mask(azimuth_deg, mask_deg)


@given(st.floats(min_value=-1e6, max_value=1e6, allow_nan=False, allow_infinity=False))
def test_wrap_azimuth_deg_range_and_periodicity(az: float) -> None:
    wrapped = wrap_azimuth_deg(az)
    assert 0.0 <= wrapped < 360.0
    assert math.isclose(wrap_azimuth_deg(az + 360.0), wrapped, abs_tol=1e-6)


@given(
    st.floats(min_value=-720.0, max_value=720.0, allow_nan=False, allow_infinity=False),
    st.lists(
        st.floats(min_value=0.0, max_value=90.0, allow_nan=False, allow_infinity=False),
        min_size=4,
        max_size=36,
    ),
)
def test_interpolate_horizon_mask_bounds_and_periodicity(
    az: float, mask: list[float]
) -> None:
    elev = interpolate_horizon_mask(az, mask)
    assert min(mask) - 1e-9 <= elev <= max(mask) + 1e-9
    assert math.isclose(
        interpolate_horizon_mask(az + 360.0, mask), elev, rel_tol=1e-9, abs_tol=1e-9
    )


@given(
    st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False),
    st.floats(min_value=0.0, max_value=100.0, allow_nan=False, allow_infinity=False),
)
def test_classify_clps_gate_thresholds(solar_pct: float, dte_pct: float) -> None:
    status = classify_clps_gate(solar_pct, dte_pct)
    if solar_pct >= SOLAR_GATE_PCT and dte_pct >= DTE_GATE_PCT:
        assert status == "PASS"
    else:
        assert status in ("SOLAR_FAIL", "DTE_FAIL", "BOTH_FAIL")


def test_lunar_physical_units_pint() -> None:
    ureg = pint.UnitRegistry()
    r_moon = R_MOON_M * ureg.meter
    assert math.isclose(r_moon.to(ureg.kilometer).magnitude, 1737.4, rel_tol=1e-9)
    az_deg = wrap_azimuth_deg(-45.0) * ureg.degree
    assert math.isclose(az_deg.to(ureg.radian).magnitude, 7 * math.pi / 4, rel_tol=1e-9)
