import { Icon } from '#components'
import { h } from 'vue'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    value: 'normal',
    label: 'Normal',
    icon: h(Icon, { name: 'i-radix-icons-question-mark-circled' }),
  },
  {
    value: 'stopped',
    label: 'Stopped',
    icon: h(Icon, { name: 'i-radix-icons-circle' }),
  },
  {
    value: 'error',
    label: 'Error',
    icon: h(Icon, { name: 'i-radix-icons-stopwatch' }),
  },
  {
    value: 'failed',
    label: 'Failed',
    icon: h(Icon, { name: 'i-radix-icons-check-circled' }),
  },
  {
    value: 'finished',
    label: 'Finished',
    icon: h(Icon, { name: 'i-radix-icons-cross-circled' }),
  },
]

export const priorities = [
  {
    value: 'low',
    label: 'Low',
    icon: h(Icon, { name: 'i-radix-icons-arrow-down' }),
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: h(Icon, { name: 'i-radix-icons-arrow-right' }),
  },
  {
    value: 'high',
    label: 'High',
    icon: h(Icon, { name: 'i-radix-icons-arrow-up' }),
  },
]
