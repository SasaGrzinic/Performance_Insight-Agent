"""Approved organisation mapping. Never persist the submitted company value."""
import re
import unicodedata

PARTNER_NAMES = (
    "Arctic Wolf", "Arctera", "Baramundi", "Cohesity", "Commvault", "HPE", "HPI",
    "Dell", "Huawei", "Everpure", "Microsoft", "Omnissa", "Veeam", "Fortinet",
    "Broadcom", "Quantum",
)


def normalize_company(value: str) -> str:
    name = unicodedata.normalize("NFKC", value).casefold().strip()
    name = re.sub(r"[.,]", "", name)
    name = re.sub(r"\s+", " ", name)
    return re.sub(r"(?:\s+(?:ag|sa|gmbh|inc|ltd))+$", "", name).strip()


PARTNER_ALIASES = {normalize_company(name) for name in PARTNER_NAMES} | {
    "hewlett packard enterprise", "dell technologies", "dell emc", "hp",
}


def company_group(value: str) -> str:
    name = normalize_company(value)
    if name == "sonio":
        return "employees"
    if name in PARTNER_ALIASES:
        return "partners"
    return "unassigned"
