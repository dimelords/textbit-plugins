import { type PropsWithChildren, useState } from 'react'
import {
  Textbit,
  Menu,
  Toolbar,
  usePluginRegistry,
  useTextbit,
  type TBPluginRegistryAction,
  type TBPluginDefinition
} from '@ttab/textbit'

import { ThemeSwitcher } from './themeSwitcher'
import { TextbitDocument } from './TextbitDocument'
import {
  Text,
  Bold,
  Italic,
  Underline,
  Link,
  CodeBlock,
  UnorderedList,
  OrderedList,
  Blockquote,
  LocalizedQuotationMarks,
  Image,
  TTVisual,
  Factbox,
  Table,
  TVListing,
  PrintText
} from '../../lib'

export function App() {
  const [value, setValue] = useState(TextbitDocument)
  const plugins: TBPluginDefinition[] = [
    Text({ classNames: { vignette: 'bg-slate-200'}}),
    PrintText(),
    Bold(),
    Italic(),
    Underline(),
    CodeBlock(),
    Link(),
    UnorderedList(),
    OrderedList(),
    Blockquote(),
    LocalizedQuotationMarks(),
    Image(),
    TTVisual(),
    Factbox(),
    Table(),
    TVListing()
  ]

  return (
    <Textbit.Root
      verbose={true}
      plugins={plugins}
      value={value}
      placeholders='multiple'
      onChange={(value) => {
        console.log(JSON.stringify(value, null, 2))
        setValue(value)
      }}
      className='h-screen grid grid-rows-[48px_1fr] mx-auto my-0 max-w-screen-md text-left'
    >
      <Header/>
      <Editable/>
    </Textbit.Root>
  )
}

function Header() {
  const { stats } = useTextbit()

  return (
    <div className="px-8 flex-grow-0 flex items-center justify-between font-sans border-b">
      <ThemeSwitcher />
      <div className="flex items-end gap-4 text-sm">
        <div>{` Words: ${stats.short.words} (${stats.full.words})`}</div>
        <div>{` Characters: ${stats.short.characters} (${stats.full.characters})`}</div>
      </div>
    </div>
  )
}

function Editable() {
  return (
    <div style={{display: 'grid', gridTemplateColumns: '50px 1fr'}}>
      <Textbit.Gutter>
        <ContentMenu />
      </Textbit.Gutter>

      <Textbit.Editable className="h-full relative overflow-scroll outline-none dark:text-slate-100">
        <Textbit.DropMarker className="h-[3px] rounded bg-blue-400/75 dark:bg-blue-500/75" />
        <ToolbarMenu />
      </Textbit.Editable>
    </div>
  )
}

function ToolbarMenu() {
  const { actions } = usePluginRegistry()

  const leafActions = actions.filter(action => ['leaf'].includes(action.plugin.class))
  const inlineActions = actions.filter(action => ['inline'].includes(action.plugin.class))

  return (
    <Toolbar.Root
      className="flex select-none divide-x p-1 border rounded-lg cursor-default shadow-xl bg-white border-gray-100 dark:text-white dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800 dark:shadow-none"
    >
      <Toolbar.Group key="leafs" className="flex place-items-center pr-1 gap-1">
        {leafActions.map(action => {
          return <ToolbarItem action={action} key={`${action.plugin.name}`} />
        })}
      </Toolbar.Group>

      <Toolbar.Group key="inlines" className="flex pl-1">
        {inlineActions.map(action => {
          return <ToolbarItem
            action={action}
            key={`${action.plugin.name}`}
          />
        })}
      </Toolbar.Group>
    </Toolbar.Root>
  )
}

function ToolbarItem({ action }: { action: TBPluginRegistryAction }) {
  return <Toolbar.Item
    action={action}
    className="p-2 w-8 h-8 flex place-items-center rounded border border-white hover:bg-gray-100 hover:border-gray-200 pointer data-[state='active']:bg-gray-100 data-[state='active']:border-gray-200 dark:border-gray-900 dark:hover:bg-slate-800 dark:hover:border-slate-700 dark:data-[state='active']:bg-gray-800 dark:data-[state='active']:border-slate-800 dark:hover:data-[state='active']:border-slate-700"
  />
}

function ContentMenu() {
  const { actions } = usePluginRegistry()

  const textActions = actions.filter(action => action.plugin.class === 'text')
  const blockActions = actions.filter(action => action.plugin.class === 'block')

  return (
    <Menu.Root className="group">
      <Menu.Trigger className="flex justify-center place-items-center center font-bold border w-8 h-8 ml-3 rounded-full cursor-default group-data-[state='open']:border-gray-200 hover:border-gray-400 dark:text-slate-200 dark:bg-slate-950 dark:border-slate-600 dark:group-data-[state='open']:border-slate-700 dark:hover:border-slate-500">⋮</Menu.Trigger>
      <Menu.Content className="flex flex-col border rounded-lg divide-y shadow-xl bg-white border-gray-100 dark:text-white dark:bg-slate-900 dark:border-slate-800 dark:divide-slate-800 dark:shadow-none">
        {textActions.length > 0 &&
          <ContentMenuGroup>
            {textActions.map(action => <ContentMenuItem action={action} key={action.name} />)}
          </ContentMenuGroup>
        }


        {blockActions.length > 0 &&
          <ContentMenuGroup>
            {blockActions.map(action => <ContentMenuItem action={action} key={action.name} />)}
          </ContentMenuGroup>
        }
      </Menu.Content>
    </Menu.Root >
  )
}

function ContentMenuGroup({ children }: PropsWithChildren) {
  return (
    <Menu.Group className="flex flex-col p-1 text-md">
      {children}
    </Menu.Group>
  )
}

function ContentMenuItem({ action }: { action: TBPluginRegistryAction }) {
  return (
    <Menu.Item
      action={action.name}
      className="grid gap-x-5 py-[0.4rem] border group grid-cols-[1.5rem_minmax(max-content,_220px)_minmax(max-content,_90px)] rounded cursor-default border-white hover:border-gray-200 hover:bg-gray-100 dark:border-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800"
    >
      <Menu.Icon className="flex justify-self-end self-center group-data-[state='active']:font-semibold" />
      <Menu.Label className="self-center text-sm group-data-[state='active']:font-semibold" />
      <Menu.Hotkey className="justify-self-end self-center pl-6 pr-3 text-sm opacity-70" />
    </Menu.Item>
  )
}

/**
Before (but still valid):
import type { TBEditor, TBElement, TBText } from '@tt/textbit'

declare module 'slate' {
  interface CustomTypes {
    Editor: TBEditor
    Element: TBElement
    Text: TBText
  }
}

import type { Element, Text, Descendant, Ancesotor } from 'slate'


Now:
import type { Element, Text, Descendant, Ancestor } from '@tt/textbit'

Before:
  <Textbit.Root>
    <Textbit.Editable initialValue={value}>
      {children}
    </Textbit.Editable>
    <Textbit.Root>

Now:
  <Textbit.Root value={value}/>
    <Textbit.Editable>
      {children}
    </Textbit.Editable>
  </Textbit.Root>
*/
