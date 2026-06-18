export interface FactboxProperties {
  title: string
  text: string
  created?: string
  modified?: string
  id?: string
  original_updated?: string
  original_version?: string
  locally_changed?: string
  rel?: string
  type?: string
  original_id?: string
}

export interface FactboxInterface {
  id: string
  class: 'block'
  type: 'core/factbox'
  properties: FactboxProperties
  children: [
    {
      type: 'core/factbox/title'
      class: 'text'
      children: [{ text: string }]
    },
    {
      type: 'core/factbox/title'
      class: 'text'
      children: [{
        type: 'core/text'
        class: 'text'
        children: [{ text: string }]
      }]
    }
  ]
}
