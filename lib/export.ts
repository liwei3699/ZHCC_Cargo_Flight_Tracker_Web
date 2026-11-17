import ExcelJS from "exceljs";
import type { ApiMeta, Flight } from "@/types";
import { EXPORT_COLUMNS } from "./export-columns";
import { dateToSerial, exportFileName, timeToFraction } from "./format";

const WIDTH: Record<string, number> = {
  航班信息: 12,
  起飞机场: 22,
  降落机场: 22,
  计划起飞时间: 14,
  实际起飞时间: 14,
  计划降落时间: 14,
  实际降落时间: 14,
  航班日期: 13,
  航班状态: 16,
  航空公司: 20,
  异常原因: 18,
  "航线（中文）": 28,
};

export function buildWorkbook(flights: Flight[], meta: ApiMeta) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "郑州新郑国际机场货运航班动态";
  workbook.title = "郑州新郑国际机场货运航班动态";
  workbook.subject = "货运航班计划与起降信息";
  workbook.description = `数据来源：https://www.zzcargo.com/airline/1；同步时间：${meta.syncedAt}`;
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheet = workbook.addWorksheet("航班动态", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = EXPORT_COLUMNS.map((column) => ({
    header: column.header,
    key: column.field,
    width: WIDTH[column.header] ?? 15,
  }));

  for (const flight of flights) {
    const row: Record<string, string | number | null> = {};
    for (const column of EXPORT_COLUMNS) {
      const raw = flight[column.field];
      const value = typeof raw === "string" ? raw : String(raw ?? "");
      row[column.field] =
        column.format === "time"
          ? value
            ? timeToFraction(value)
            : null
          : column.format === "date"
            ? value
              ? dateToSerial(value)
              : null
            : value || null;
    }
    sheet.addRow(row);
  }

  const header = sheet.getRow(1);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: "FF181D26" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  sheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, columnNumber) => {
      cell.alignment = { horizontal: "center", vertical: "middle" };
      if (rowNumber > 1) {
        const format = EXPORT_COLUMNS[columnNumber - 1].format;
        if (format === "time") cell.numFmt = "hh:mm";
        if (format === "date") cell.numFmt = "m/d/yyyy";
      }
    });
  });

  sheet.autoFilter = { from: "A1", to: `AD${flights.length + 1}` };
  return workbook;
}

export async function exportFlightsToXlsx(flights: Flight[], meta: ApiMeta) {
  const workbook = buildWorkbook(flights, meta);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = exportFileName();
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
