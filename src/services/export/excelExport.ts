import ExcelJS from 'exceljs';
import type { GuideDocument } from '@/types';
import { downloadBlob, slugify } from '@/utils/helpers';

const COLORS = {
  headerBg: 'FF0F766E',
  headerFg: 'FFFFFFFF',
  sectionBg: 'FFE6F4F1',
  sectionFg: 'FF134E4A',
  tableHeaderBg: 'FFF3F4F6',
  border: 'FFD0D0CA',
  zebra: 'FFFAFAF8',
};

function styleRange(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number,
  options: {
    fill?: string;
    bold?: boolean;
    color?: string;
    border?: boolean;
  },
) {
  for (let r = startRow; r <= endRow; r += 1) {
    for (let c = startCol; c <= endCol; c += 1) {
      const cell = sheet.getCell(r, c);
      if (options.fill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: options.fill },
        };
      }
      if (options.bold || options.color) {
        cell.font = {
          bold: options.bold,
          color: options.color ? { argb: options.color } : undefined,
        };
      }
      if (options.border) {
        cell.border = {
          top: { style: 'thin', color: { argb: COLORS.border } },
          left: { style: 'thin', color: { argb: COLORS.border } },
          bottom: { style: 'thin', color: { argb: COLORS.border } },
          right: { style: 'thin', color: { argb: COLORS.border } },
        };
      }
    }
  }
}

function addSectionTitle(
  sheet: ExcelJS.Worksheet,
  title: string,
  colCount: number,
): number {
  const row = sheet.addRow([title]);
  const rowNumber = row.number;
  sheet.mergeCells(rowNumber, 1, rowNumber, colCount);
  styleRange(sheet, rowNumber, rowNumber, 1, colCount, {
    fill: COLORS.headerBg,
    bold: true,
    color: COLORS.headerFg,
  });
  row.height = 22;
  return rowNumber;
}

function addSubSectionTitle(
  sheet: ExcelJS.Worksheet,
  title: string,
  colCount: number,
): number {
  const row = sheet.addRow([title]);
  const rowNumber = row.number;
  sheet.mergeCells(rowNumber, 1, rowNumber, colCount);
  styleRange(sheet, rowNumber, rowNumber, 1, colCount, {
    fill: COLORS.sectionBg,
    bold: true,
    color: COLORS.sectionFg,
    border: true,
  });
  return rowNumber;
}

function addKeyValueTable(
  sheet: ExcelJS.Worksheet,
  rows: Array<[string, string]>,
): void {
  const header = sheet.addRow(['Field', 'Value']);
  styleRange(sheet, header.number, header.number, 1, 2, {
    fill: COLORS.tableHeaderBg,
    bold: true,
    border: true,
  });

  rows.forEach(([field, value], index) => {
    const row = sheet.addRow([field, value]);
    styleRange(sheet, row.number, row.number, 1, 2, {
      fill: index % 2 === 0 ? undefined : COLORS.zebra,
      border: true,
    });
    row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
  });
}

export async function exportGuideToExcel(document: GuideDocument): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Measurement Guide App';
  workbook.created = new Date();

  // Overview / Index
  const overview = workbook.addWorksheet('Overview');
  overview.columns = [
    { width: 8 },
    { width: 36 },
    { width: 14 },
    { width: 22 },
    { width: 24 },
    { width: 12 },
  ];

  addSectionTitle(overview, 'Measurement Guide — Overview', 6);
  overview.addRow([]);
  addSubSectionTitle(overview, 'Guide information', 6);
  addKeyValueTable(overview, [
    ['Title', document.title],
    ['Client', document.client],
    ['Project', document.project],
    ['Generated at', document.generatedAt],
  ]);

  overview.addRow([]);
  addSubSectionTitle(overview, 'Event Index', 6);
  const indexHeader = overview.addRow([
    '#',
    'Name',
    'Type',
    'event',
    'event_name',
    'Tested',
  ]);
  styleRange(overview, indexHeader.number, indexHeader.number, 1, 6, {
    fill: COLORS.tableHeaderBg,
    bold: true,
    border: true,
  });

  document.index.forEach((item, index) => {
    const row = overview.addRow([
      index + 1,
      item.name,
      item.structureType,
      item.event,
      item.event_name,
      '☐',
    ]);
    styleRange(overview, row.number, row.number, 1, 6, {
      fill: index % 2 === 0 ? undefined : COLORS.zebra,
      border: true,
    });
    row.getCell(6).alignment = { horizontal: 'center' };
  });

  // QA Checklist sheet
  const qaSheet = workbook.addWorksheet('QA Checklist');
  qaSheet.columns = [{ width: 8 }, { width: 70 }, { width: 14 }];
  addSectionTitle(qaSheet, 'QA Checklist', 3);
  qaSheet.addRow([]);
  const qaIntro = qaSheet.addRow([
    '',
    'Use this checklist when validating the events in this measurement guide.',
    '',
  ]);
  qaSheet.mergeCells(qaIntro.number, 2, qaIntro.number, 3);
  qaIntro.getCell(2).font = { italic: true, color: { argb: 'FF5C5C5C' } };

  qaSheet.addRow([]);
  const qaHeader = qaSheet.addRow(['#', 'Checkpoint', 'Done']);
  styleRange(qaSheet, qaHeader.number, qaHeader.number, 1, 3, {
    fill: COLORS.tableHeaderBg,
    bold: true,
    border: true,
  });

  document.qaChecklist.forEach((item, index) => {
    const row = qaSheet.addRow([index + 1, item, '☐']);
    styleRange(qaSheet, row.number, row.number, 1, 3, {
      fill: index % 2 === 0 ? undefined : COLORS.zebra,
      border: true,
    });
    row.getCell(3).alignment = { horizontal: 'center' };
  });

  // Measurement Guide events
  const guideSheet = workbook.addWorksheet('Measurement Guide');
  guideSheet.columns = [
    { width: 28 },
    { width: 55 },
    { width: 28 },
    { width: 18 },
  ];

  addSectionTitle(guideSheet, 'Measurement Guide — Event Details', 4);
  guideSheet.addRow([]);

  for (const [eventIndex, event] of document.events.entries()) {
    if (eventIndex > 0) {
      guideSheet.addRow([]);
      guideSheet.addRow([]);
    }

    addSectionTitle(guideSheet, `${eventIndex + 1}. ${event.name}`, 4);

    addSubSectionTitle(guideSheet, 'General information', 4);
    addKeyValueTable(guideSheet, [
      ['Type', event.structureLabel],
      ['Priority', event.priorityLabel],
      ['Interaction', event.interactionType],
      ['Client', event.client],
      ['Project', event.project],
      ['Description', event.description || '—'],
      ['Business objective', event.businessObjective || '—'],
    ]);

    guideSheet.addRow([]);
    addSubSectionTitle(guideSheet, 'How it triggers', 4);
    addKeyValueTable(guideSheet, [['Description', event.howItTriggers || '—']]);

    guideSheet.addRow([]);
    addSubSectionTitle(guideSheet, 'Event data', 4);
    const dataRows: Array<[string, string]> = [
      ['event', event.event],
      ['event_name', event.event_name],
      ['eventCategory', event.eventCategory],
      ['eventAction', event.eventAction],
      ['eventLabel', event.eventLabel],
      ...event.customParams.map((param) => [param.key, param.value] as [string, string]),
    ];
    addKeyValueTable(guideSheet, dataRows);

    guideSheet.addRow([]);
    addSubSectionTitle(guideSheet, 'Implementation script', 4);
    const scriptRow = guideSheet.addRow(['Script', event.script]);
    styleRange(guideSheet, scriptRow.number, scriptRow.number, 1, 2, { border: true });
    scriptRow.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    scriptRow.height = 80;

    guideSheet.addRow([]);
    addSubSectionTitle(guideSheet, 'Technical specification', 4);
    addKeyValueTable(guideSheet, [
      ['Development notes', event.technical.developmentNotes || '—'],
    ]);

    if (event.technical.requiredVariables.length > 0) {
      guideSheet.addRow([]);
      addSubSectionTitle(guideSheet, 'DataLayer dictionary', 4);
      const dictHeader = guideSheet.addRow([
        'Variable',
        'Description',
        'Example',
        'Required',
      ]);
      styleRange(guideSheet, dictHeader.number, dictHeader.number, 1, 4, {
        fill: COLORS.tableHeaderBg,
        bold: true,
        border: true,
      });
      event.technical.requiredVariables.forEach((variable, index) => {
        const row = guideSheet.addRow([
          variable.name,
          variable.description,
          variable.example,
          variable.required ? 'Yes' : 'No',
        ]);
        styleRange(guideSheet, row.number, row.number, 1, 4, {
          fill: index % 2 === 0 ? undefined : COLORS.zebra,
          border: true,
        });
      });
    }

    if (event.screenshotDataUrl?.startsWith('data:image')) {
      try {
        const base64 = event.screenshotDataUrl.split(',')[1];
        if (base64) {
          guideSheet.addRow([]);
          addSubSectionTitle(guideSheet, 'Screenshot', 4);
          const imageId = workbook.addImage({
            base64,
            extension: event.screenshotDataUrl.includes('image/png') ? 'png' : 'jpeg',
          });
          const rowNumber = guideSheet.rowCount + 1;
          guideSheet.addRow(['', '']);
          guideSheet.addImage(imageId, {
            tl: { col: 0, row: rowNumber - 1 },
            ext: { width: 360, height: 200 },
          });
          guideSheet.getRow(rowNumber).height = 160;
        }
      } catch {
        guideSheet.addRow(['Screenshot', 'Could not embed image']);
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(blob, `${slugify(document.title)}.xlsx`);
}
