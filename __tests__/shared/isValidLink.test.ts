import { describe, test, expect } from 'vitest'
import { isValidLink } from '../../lib/shared/isValidLink'

describe('isValidLink', () => {
  test('Valid https link should return true', () => {
    expect(isValidLink('https://www.example.com')).toBe(true)
  })

  test('Valid http link should return true', () => {
    expect(isValidLink('http://example.com')).toBe(true)
  })

  test('Valid mailto link should return true', () => {
    expect(isValidLink('mailto://mr.example@example.com')).toBe(true)
  })

  test('Valid tel link should return true', () => {
    expect(isValidLink('tel://+155501010101')).toBe(true)
  })

  test('Javascript link should return false', () => {
    expect(isValidLink('javascript://alert("h4cked")')).toBe(false)
  })

  test('Root path link without scheme should return true', () => {
    expect(isValidLink('/foobar')).toBe(true)
  })

  test('Relative path link without scheme should return true', () => {
    expect(isValidLink('foobar')).toBe(true)
  })

  test('Empty link should return false', () => {
    expect(isValidLink('')).toBe(false)
  })

  test('Wrong type for link should return false', () => {
    // @ts-expect-error Testing faulty input
    expect(isValidLink(undefined)).toBe(false)
  })
})
