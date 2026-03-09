// src/sanity/schemas/formPageContent.ts
//
// Schema for the editable copy on form/action pages.
// The FORMS themselves stay in code (they're functional components).
// This schema controls the COPY around the forms — headlines, descriptions, cards, legal text.

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'formPageContent',
  title: 'Form Page Content',
  type: 'document',
  icon: () => '📝',

  fields: [
    defineField({
      name: 'formType',
      title: 'Form Type',
      type: 'string',
      options: {
        list: [
          { title: 'Join the Party', value: 'join' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Contact', value: 'contact' },
          { title: 'CCX Registration', value: 'ccx-register' },
          { title: 'Run for Office', value: 'run' },
          { title: 'Donate', value: 'donate' },
          { title: 'Submit Ideas', value: 'submit-ideas' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // ── Hero ───────────────────────────────────────
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageCredit',
      title: 'Image Credit',
      type: 'string',
    }),

    // ── Body Content ──────────────────────────────
    defineField({
      name: 'bodyContent',
      title: 'Body Content',
      type: 'array',
      description: 'Main content above or around the form',
      of: [
        {
          type: 'block',
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'string', title: 'URL' },
                ],
              },
            ],
          },
        },
      ],
    }),

    // ── Feature Cards ─────────────────────────────
    defineField({
      name: 'cards',
      title: 'Feature Cards',
      type: 'array',
      description: 'Cards like "Your Voice Matters", "Be First", "Change the Math" on the Join page',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'icon', title: 'Icon', type: 'string' },
            { name: 'headline', title: 'Card Headline', type: 'string' },
            { name: 'body', title: 'Card Body', type: 'text', rows: 3 },
          ],
          preview: {
            select: { title: 'headline' },
          },
        },
      ],
    }),

    // ── CTA & Legal ───────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Submit Button Label',
      type: 'string',
      description: 'e.g., "I\'M IN", "SEND MESSAGE", "COUNT ME IN"',
    }),
    defineField({
      name: 'legalText',
      title: 'Legal Fine Print',
      type: 'text',
      rows: 3,
      description: 'The fine print below the form (e.g., "By joining, you\'ll receive updates...")',
    }),

    // ── Confirmation ──────────────────────────────
    defineField({
      name: 'confirmationHeadline',
      title: 'Confirmation Headline',
      type: 'string',
      description: 'Shown after successful form submission',
    }),
    defineField({
      name: 'confirmationBody',
      title: 'Confirmation Body',
      type: 'text',
      rows: 3,
    }),
  ],

  preview: {
    select: {
      title: 'formType',
      subtitle: 'heroHeadline',
    },
    prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
      const labels: Record<string, string> = {
        join: '🤝 Join the Party',
        volunteer: '🙋 Volunteer',
        contact: '📬 Contact',
        'ccx-register': '🎪 CCX Registration',
        run: '🏃 Run for Office',
        donate: '💰 Donate',
        'submit-ideas': '💡 Submit Ideas',
      }
      return {
        title: labels[title || ''] || title || 'Form Page',
        subtitle,
      }
    },
  },
})
