export function csv(rows: (string | number | null | undefined)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = value == null ? "" : String(value);
            if (typeof value === "string" && /^[\s]*[=+\-@]/.test(text))
              text = "'" + text;
            return '"' + text.replaceAll('"', '""') + '"';
          })
          .join(";"),
      )
      .join("\r\n")
  );
}
export function saveCSV(
  name: string,
  rows: (string | number | null | undefined)[][],
) {
  const url = URL.createObjectURL(
    new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
