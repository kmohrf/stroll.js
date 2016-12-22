import createStroller from './factory'
import { createElementAdapter, createWindowAdapter } from './adapters'

const publicAdapters = {
  element: createElementAdapter
}

const stroll = createStroller(createWindowAdapter())

stroll.factory = function (el, adapter = 'element') {
  if (typeof adapter === 'string') {
    adapter = publicAdapters[adapter]
  }

  return createStroller(adapter(el))
}

export default stroll
