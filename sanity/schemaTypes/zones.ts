// sanity/schemaTypes/zones.ts
export const zones = {
  name: 'zones',
  title: 'Zones',
  type: 'document',
  fields: [
    {
      name: 'zone',
      title: 'Zone Name',
      type: 'string',
      options: {
        list: [
          'Chamkote',
          'Drugmulla',
          'Handwara',
          'Khumriyal',
          'Kralpora',
          'Kupwara',
          'Langate',
          'Mawer',
          'Rajwar',
          'Sogam',
          'Tangdar',
          'Trehgam',
          'Villgam',
        ],
      },
      validation: (Rule: any) => Rule.required().error('Zone name is required'),
    },
    {
      name: 'code',
      title: 'Zone Code',
      type: 'string',
      description: 'Unique alphanumeric or UDISE block/zone code (e.g., 010108 or ZN-MWR)',
      validation: (Rule: any) =>
        Rule.required()
          .min(2)
          .max(20)
          .error('Zone code is required (2–20 characters)'),
    },
  ],
  preview: {
    select: {
      title: 'zone',
      subtitle: 'code',
    },
    prepare({ title, subtitle }: any) {
      return {
        title: title || 'Unnamed Zone',
        subtitle: subtitle ? `Code: ${subtitle}` : 'No Code Assigned',
      };
    },
  },
};