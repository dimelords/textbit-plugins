import {
  type Editor,
  type Element
} from 'slate'
import {
  type TBAction,
  type TBPluginOptions,
  TextbitEditor
} from '@ttab/textbit'

import {
  Heading1Icon,
  Heading2Icon,
  ListStartIcon,
  MapIcon,
  TextIcon
} from 'lucide-react'

type TextStyleAction = TBAction & { role?: string }

export const getTextStyles = (options: TBPluginOptions): TextStyleAction[] => {
  const textStyles: TextStyleAction[] = [
    {
      name: 'set-heading-1',
      role: 'heading-1',
      title: `${options?.titleLabel}` || 'Title',
      hotkey: (options?.preventHotkeys as string[])?.includes('heading-1') ? undefined : 'mod+option+1',
      tool: () => <Heading1Icon style={{ width: '1em', height: '1em' }} />,
      handler: ({ editor }) => { convertTextType(editor, 'heading-1') },
      visibility: (element: Element) => toolVisibility(element, 'heading-1')
    },
    {
      name: 'set-heading-2',
      role: 'heading-2',
      title: `${options?.subTitleLabel}` || 'Subtitle',
      hotkey: (options?.preventHotkeys as string[])?.includes('heading-2') ? undefined : 'mod+option+2',
      tool: () => <Heading2Icon style={{ width: '1em', height: '1em' }} />,
      handler: ({ editor }) => convertTextType(editor, 'heading-2'),
      visibility: (element: Element) => toolVisibility(element, 'heading-2')
    },
    {
      name: 'set-preamble',
      role: 'preamble',
      title: `${options?.preambleLabel}` || 'Preamble',
      hotkey: (options?.preventHotkeys as string[])?.includes('preamble') ? undefined : 'mod+option+3',
      tool: () => <ListStartIcon style={{ width: '1em', height: '1em' }} />,
      handler: ({ editor }) => convertTextType(editor, 'preamble'),
      visibility: (element: Element) => toolVisibility(element, 'preamble')
    },
    {
      name: 'set-body',
      title: `${options?.bodyTextLabel}` || 'Body text',
      hotkey: 'mod+option+0',
      tool: () => <TextIcon style={{ width: '1em', height: '1em' }} />,
      handler: ({ editor }) => convertTextType(editor),
      visibility: (element: Element) => toolVisibility(element)
    },
    {
      name: 'set-dateline',
      role: 'vignette',
      title: `${options?.vignetteLabel}` || 'Vignette',
      hotkey: undefined,
      tool: () => <MapIcon style={{ width: '1em', height: '1em' }} />,
      handler: ({ editor }) => convertTextType(editor, 'vignette'),
      visibility: (element: Element) => toolVisibility(element, 'vignette')
    }
  ]

  if (Array.isArray(options.styles)) {
    return textStyles.filter(ts => (options.styles as string[]).includes(ts.name))
  }

  return textStyles
}

function toolVisibility(element: Element, role?: string): [boolean, boolean, boolean] {
  return [
    ['core/ordered-list', 'core/unordered-list', 'core/text'].includes(element.type),
    true,
    element.type === 'core/text' && element?.properties?.role === role
  ]
}

function convertTextType(editor: Editor, subType?: string): void {
  TextbitEditor.convertToTextNode(editor, 'core/text', subType)
}
