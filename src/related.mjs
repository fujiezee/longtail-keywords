/** Pages on doc.duaer.com that match a seed. Only real guides. */
export const relatedGuides = [
  {
    test: /企业知识库|company document|knowledge base|ai assistant/i,
    href: 'https://doc.duaer.com/guides/ai-assistant-company-documents/',
    zh: 'https://doc.duaer.com/zh/guides/ai-assistant-company-documents/',
    label: 'How to build an AI assistant on company documents with Duaer',
  },
  {
    test: /glean/i,
    href: 'https://doc.duaer.com/guides/glean-alternatives/',
    zh: 'https://doc.duaer.com/zh/guides/glean-alternatives/',
    label: 'Glean alternatives for mid-sized companies',
  },
  {
    test: /找不到|can.?t find|new hire|新员工/i,
    href: 'https://doc.duaer.com/guides/employees-cant-find-information/',
    zh: 'https://doc.duaer.com/zh/guides/employees-cant-find-information/',
    label: 'Employees can’t find company information',
  },
  {
    test: /权限|permission/i,
    href: 'https://doc.duaer.com/guides/permission-aware-ai-search/',
    zh: 'https://doc.duaer.com/zh/guides/permission-aware-ai-search/',
    label: 'Permission-aware enterprise AI search',
  },
  {
    test: /到期|校准|expiry|calibration|合同/i,
    href: 'https://doc.duaer.com/guides/expiry-date-reminders/',
    zh: 'https://doc.duaer.com/zh/guides/expiry-date-reminders/',
    label: 'Expiry date tracking and reminders',
  },
  {
    test: /发票|invoice|pdf/i,
    href: 'https://doc.duaer.com/tasks/pdf-invoices-to-excel/',
    zh: 'https://doc.duaer.com/zh/tasks/pdf-invoices-to-excel/',
    label: 'Extract PDF invoices into an Excel sheet with Duaer',
  },
];

export function guidesFor(seed) {
  return relatedGuides.filter((guide) => guide.test.test(seed));
}
