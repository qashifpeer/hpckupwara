// src/sanity/schemaTypes/masterSchoolProfile.ts
import { defineField, defineType } from 'sanity';

export const dataCompleted = defineType({
  name: 'dataCompleted',
  title: 'Data Completed Schools',
  type: 'document',
  fields: [
    defineField({
      name: 'udiseCode',
      title: 'UDISE Code',
      type: 'string',
      validation: (Rule) =>
        Rule.required()
          .regex(/^0\d{10}$/, { name: 'UDISE' })
          .error('UDISE must be 11 digits starting with 0'),
    }),
    defineField({
      name: 'schoolName',
      title: 'School Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'managementType',
      title: 'Management Type',
      type: 'string',
    }),
    defineField({
      name: 'subManagementType',
      title: 'Sub-Management Type',
      type: 'string',
    }),
    defineField({
      name: 'mediumOfInstruction',
      title: 'Medium of Instruction',
      type: 'string',
    }),
    defineField({
      name: 'academicYear',
      title: 'Current Academic Year',
      type: 'string',
    }),
    defineField({
      name: 'academicCycle',
      title: 'Academic Session Months',
      type: 'object',
      fields: [
        defineField({ name: 'startMonth', title: 'Start Month', type: 'string' }),
        defineField({ name: 'endMonth', title: 'End Month', type: 'string' }),
      ],
    }),
    defineField({
      name: 'addressLine1',
      title: 'Address Line 1',
      type: 'string',
    }),
    defineField({
      name: 'addressLine2',
      title: 'Address Line 2',
      type: 'string',
    }),
    defineField({
      name: 'villageCity',
      title: 'Village / City',
      type: 'string',
    }),
    defineField({
      name: 'brc',
      title: 'BRC',
      type: 'string',
    }),
    defineField({
      name: 'crc',
      title: 'CRC',
      type: 'string',
    }),
    defineField({
      name: 'locationType',
      title: 'Location (Rural/Urban)',
      type: 'string',
      options: {
        list: ['Rural', 'Urban'],
      },
    }),
    defineField({
      name: 'pinCode',
      title: 'PIN Code',
      type: 'string',
    }),
    defineField({
      name: 'adminStatus',
      title: 'Admin Allocation Status',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'schoolName',
      subtitle: 'villageCity',
      description: 'udiseCode',
    },
    prepare({ title, subtitle, description }) {
      return {
        title: title || 'Untitled School',
        subtitle: `${subtitle || 'N/A'} | UDISE: ${description || 'N/A'}`,
      };
    },
  },
});