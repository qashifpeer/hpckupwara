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
    },
    {
      name: 'staffRegisteredOnHpc',
      title: 'Staff Registered on HPC',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
    },
    {
      name: 'studentEnrollmentKto8',
      title: 'Total Student Enrollment (Kindergarten to 8th)',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
    },
    {
      name: 'registeredStudentEnrollment',
      title: 'Registered Student Enrollment on HPC',
      type: 'number',
      hidden: ({ document }: any) => document?.registeredOnHpc !== 'Yes',
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