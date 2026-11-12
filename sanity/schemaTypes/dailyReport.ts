// sanity/schemas/dailyreport.ts
export const dailyReport = {
  name: 'dailyReport',
  title: 'Daily Report',
  type: 'document',
  fields: [
    {
      name: 'state',
      title: 'State / UT',
      type: 'string',
      initialValue: 'Jammu & Kashmir',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'district',
      title: 'District',
      type: 'string',
      initialValue: 'Kupwara',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'udiseCode',
      title: 'UDISE Code',
      type: 'string',
      validation: (Rule: any) =>
        Rule.required()
          .regex(/^0\d{10}$/, { name: 'UDISE' })
          .error('UDISE must be 11 digits starting with 0'),
    },
    {
      name: 'schoolName',
      title: 'School Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'managementType',
      title: 'Management Type',
      type: 'string',
      options: {
        list: [
          'Department of Education',
          'Private Unaided',
          'Tribal Welfare Department',
          'Central Govt / KVS / JNV',
          'Local Body',
          'Other',
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'totalStudents',
      title: 'Total Students',
      type: 'number',
      validation: (Rule: any) =>
        Rule.required()
          .min(0)
          .max(1000)
          .integer()
          .error('Total students must be a whole number between 0 and 1000'),
    },
    {
      name: 'pending',
      title: 'Pending',
      type: 'number',
      initialValue: 0,
      validation: (Rule: any) =>
        Rule.required()
          .min(0)
          .max(1000)
          .integer()
          .custom((value: number | undefined, context: any) => {
            const total = context.document?.totalStudents;
            if (typeof value === 'number' && typeof total === 'number' && value > total) {
              return 'Pending count cannot exceed Total Students';
            }
            return true;
          }),
    },
    {
      name: 'inProgress',
      title: 'In Progress',
      type: 'number',
      initialValue: 0,
      validation: (Rule: any) =>
        Rule.required()
          .min(0)
          .max(1000)
          .integer()
          .custom((value: number | undefined, context: any) => {
            const total = context.document?.totalStudents;
            if (typeof value === 'number' && typeof total === 'number' && value > total) {
              return 'In Progress count cannot exceed Total Students';
            }
            return true;
          }),
    },
    {
      name: 'completed',
      title: 'Completed',
      type: 'number',
      initialValue: 0,
      validation: (Rule: any) =>
        Rule.required()
          .min(0)
          .max(1000)
          .integer()
          .custom((value: number | undefined, context: any) => {
            const doc = context.document;
            const total = doc?.totalStudents;
            if (typeof value === 'number' && typeof total === 'number') {
              if (value > total) return 'Completed count cannot exceed Total Students';
              const sum = (doc?.pending || 0) + (doc?.inProgress || 0) + value;
              if (sum > total) {
                return `Sum of Pending + In Progress + Completed (${sum}) cannot exceed Total Students (${total})`;
              }
            }
            return true;
          }),
    },
    {
      name: 'reportedAt',
      title: 'Report Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
  preview: {
    select: {
      title: 'schoolName',
      udise: 'udiseCode',
      completed: 'completed',
      total: 'totalStudents',
    },
    prepare({ title, udise, completed, total }: any) {
      return {
        title: title || 'Unnamed School',
        subtitle: `UDISE: ${udise || 'N/A'} | Completed: ${completed ?? 0} / ${total ?? 0}`,
      };
    },
  },
};