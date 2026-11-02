// src/sanity/schemaTypes/masterSchool.ts
import { defineField, defineType } from 'sanity';

export const masterSchool = defineType({
  name: 'masterSchool',
  title: 'Master School Directory',
  type: 'document',
  fields: [
    defineField({
      name: 'udiseCode',
      title: 'UDISE Code',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^0\d{10}$/, { name: 'UDISE' })
          .error('UDISE must be exactly 11 digits starting with 0'),
    }),
    defineField({
      name: 'schoolName',
      title: 'School Name (as per UDISE)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'zone',
      title: 'Educational Zone',
      type: 'string',
      options: {
        list: [
          'Chamkote', 'Drugmulla', 'Handwara', 'Khumriyal',
          'Kralpora', 'Kupwara', 'Langate', 'Mawer',
          'Rajwar', 'Sogam', 'Tangdar', 'Trehgam', 'Villgam',
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'schoolName',
      subtitle: 'zone',
      description: 'udiseCode',
    },
    prepare({ title, subtitle, description }) {
      return {
        title: title || 'Untitled School',
        subtitle: `Zone: ${subtitle || 'N/A'} | UDISE: ${description || 'N/A'}`,
      };
    },
  },
});