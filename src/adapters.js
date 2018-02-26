function resolveTargetFactory (el, createPositionFromNumber) {
  return function resolveTarget (userTarget, start, offset) {
    const type = typeof userTarget
    const target = type === 'string' ? el.querySelector(userTarget) : userTarget
    const result = {}

    if (userTarget === null || type === 'undefined') {
      const zero = { x: 0, y: 0 }
      return resolveTarget(offset, zero, zero)
    }

    if (type === 'number') {
      const pos = createPositionFromNumber(userTarget)

      // add start and offset to axes, that are not 0 by default
      pos.x = pos.x - start.x + offset.x
      pos.y = pos.y - start.y + offset.y

      result.target = pos
      result.focus = false
      return result
    }

    if (type === 'object' && !(userTarget instanceof window.HTMLElement)) {
      result.target = {
        x: (userTarget.x || 0) - start.x + offset.x,
        y: (userTarget.y || 0) - start.y + offset.y
      }
      result.focus = false
      return result
    }

    if (!target || !target.getBoundingClientRect) {
      throw new Error('invalid target')
    }

    const boundingRect = target.getBoundingClientRect()
    result.element = target
    result.target = {
      x: boundingRect.left + offset.x,
      y: boundingRect.top + offset.y
    }

    return result
  }
}

function createPositionFromNumberFactory (calculateMaxima) {
  return function (number) {
    const maxima = calculateMaxima()
    const primaryAxis = maxima.y > maxima.x ? 'y' : 'x'
    const result = {}

    result[primaryAxis] = number
    result[primaryAxis === 'x' ? 'y' : 'x'] = 0

    return result
  }
}

function isPositionOutsideOfElementFactory (calculateMaxima) {
  return function (pos) {
    if (typeof pos !== 'object') return true
    const maxima = calculateMaxima()
    return (pos.x < 0 || pos.x > maxima.x) || (pos.y < 0 || pos.y > maxima.y)
  }
}

function createBaseAdapter (el, calculateMaxima) {
  const createPositionFromNumber = createPositionFromNumberFactory(calculateMaxima)
  const isPositionOutsideOfElement = isPositionOutsideOfElementFactory(calculateMaxima)
  const resolveTarget = resolveTargetFactory(el, createPositionFromNumber)

  return { createPositionFromNumber, resolveTarget, isPositionOutsideOfElement }
}

function createWindowAdapter () {
  function calculateMaxima () {
    const documentWidth = Math.max(
                document.body.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.clientWidth,
                document.documentElement.scrollWidth,
                document.documentElement.offsetWidth
            ) - window.innerWidth
    const x = Math.max(0, documentWidth)

    const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            ) - window.innerHeight
    const y = Math.max(0, documentHeight)

    return { x, y }
  }

  return Object.assign(createBaseAdapter(document, calculateMaxima), {
    getCurrentPosition () {
      return {
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset
      }
    },
    scrollTo (pos) {
      window.scrollTo(pos.x, pos.y)
    }
  })
}

function createElementAdapter (el) {
  function calculateMaxima () {
    return {
      x: Math.max(0, el.scrollWidth - el.clientWidth),
      y: Math.max(0, el.scrollHeight - el.clientHeight)
    }
  }

  return Object.assign(createBaseAdapter(el, calculateMaxima), {
    getCurrentPosition () {
      return { x: el.scrollLeft, y: el.scrollTop }
    },
    scrollTo (pos) {
      el.scrollLeft = pos.x
      el.scrollTop = pos.y
    }
  })
}

export {
    createWindowAdapter,
    createElementAdapter
}
