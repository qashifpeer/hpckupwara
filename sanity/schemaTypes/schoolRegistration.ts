export const schoolRegistration = {
  name: 'schoolRegistration',
  title: 'School Registration',
  type: 'document',
  fields: [
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
      title: 'School Name (as per UDISE)',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'zone',
      title: 'Zone',
      type: 'string',
      options: {
        list: [
          'Chamkote', 'Drugmulla', 'Kupwara', 'Handwara',
          'Khumriyal', 'Kralpora', 'Langate', 'Mawer',
          'Rajwar', 'Sogam', 'Tangdar', 'Trehgam', 'Villgam',
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'registeredOnHpc',
      title: 'Registered on HPC Portal',
      type: 'string',
      options: {
        list: ['Yes', 'No'],
        layout: 'radio',
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'reasonIfNotRegistered',
      title: 'Reason for not registering',
      type: 'text',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'No',
    },
    {
      name: 'totalStaff',
      title: 'Total Staff',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
      validation: (Rule: any) =>
        Rule.custom((value: number | undefined, context: any) => {
          if (context.document?.registeredOnHpc === 'Yes') {
            if (value === undefined || value === null) return 'Total staff is required';
            if (value < 0 || value > 1000) return 'Total staff must be between 0 and 1000';
            if (!Number.isInteger(value)) return 'Must be a whole number';
          }
          return true;
        }),
    },
    {
      name: 'staffRegisteredOnHpc',
      title: 'Staff Registered on HPC',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
      validation: (Rule: any) =>
        Rule.custom((value: number | undefined, context: any) => {
          if (context.document?.registeredOnHpc === 'Yes') {
            if (value === undefined || value === null) return 'Registered staff count is required';
            if (value < 0 || value > 1000) return 'Registered staff must be between 0 and 1000';
            if (!Number.isInteger(value)) return 'Must be a whole number';
            const total = context.document?.totalStaff;
            if (typeof total === 'number' && value > total) {
              return 'Registered staff cannot exceed Total Staff';
            }
          }
          return true;
        }),
    },
    {
      name: 'studentEnrollmentKto8',
      title: 'Total Student Enrollment (Kindergarten to 8th)',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
      validation: (Rule: any) =>
        Rule.custom((value: number | undefined, context: any) => {
          if (context.document?.registeredOnHpc === 'Yes') {
            if (value === undefined || value === null) return 'Student enrollment is required';
            if (value < 0 || value > 1000) return 'Enrollment must be between 0 and 1000';
            if (!Number.isInteger(value)) return 'Must be a whole number';
          }
          return true;
        }),
    },
    {
      name: 'registeredStudentEnrollment',
      title: 'Registered Student Enrollment on HPC',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
      validation: (Rule: any) =>
        Rule.custom((value: number | undefined, context: any) => {
          if (context.document?.registeredOnHpc === 'Yes') {
            if (value === undefined || value === null) return 'Registered student enrollment is required';
            if (value < 0 || value > 1000) return 'Registered enrollment must be between 0 and 1000';
            if (!Number.isInteger(value)) return 'Must be a whole number';
            const total = context.document?.studentEnrollmentKto8;
            if (typeof total === 'number' && value > total) {
              return 'Registered students cannot exceed Total Enrollment';
            }
          }
          return true;
        }),
    },
    {
      name: 'adminPhone',
      title: 'Phone Number of School Admin',
      type: 'string',
      validation: (Rule: any) =>
        Rule.required()
          .regex(/^[6-9]\d{9}$/)
          .error('Enter a valid 10-digit Indian mobile number'),
    },
    {
      name: 'submittedAt',
      title: 'Submission Timestamp',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
};