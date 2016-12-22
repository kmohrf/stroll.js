function createOptions (defaults, options, adapter) {
  return Object.assign({
    ignoreUserScroll: false,
    allowInvalidPositions: false,
    offset: { x: 0, y: 0 },
    duration: 500,
    focus: true,
    // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
    easing: (t, b, c, d) => {
      t /= d / 2
      if (t < 1) return c / 2 * t * t + b
      t--
      return -c / 2 * (t * (t - 2) - 1) + b
    }
  }, defaults, options, {
    start: adapter.getCurrentPosition()
  })
}

function resolveDuration (duration, distance) {
  const type = typeof duration

  if (type === 'number') return duration
  if (type === 'function') return duration(distance)

  const parsed = parseFloat(duration)

  if (isNaN(parsed)) {
    throw new Error('invalid duration')
  }

  return parsed
}

function resolveOffset (offset, adapter) {
  const type = typeof offset

  if (type === 'number') {
    return adapter.createPositionFromNumber(offset)
  }

  if (type === 'object') {
    if (typeof offset.x === 'undefined') offset.x = 0
    if (typeof offset.y === 'undefined') offset.y = 0

    return offset
  }

  throw new Error('invalid offset')
}

function positionAbsolute (distance) {
  return { x: Math.abs(distance.x), y: Math.abs(distance.y) }
}

function positionCompare (pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

function positionAdd (pos1, pos2) {
  return { x: pos1.x + pos2.x, y: pos1.y + pos2.y }
}

function ease (easing, timeElapsed, start, target, duration) {
  return {
    x: Math.round(easing(timeElapsed, start.x, target.x, duration)),
    y: Math.round(easing(timeElapsed, start.y, target.y, duration))
  }
}

function createLoop (stroll, options) {
  const adapter = options.adapter

  function startLoop (resolve) {
    let animationFrame
    let timeStart
    let lastPosition

    function loop (timeCurrent) {
      if (!timeStart) {
        timeStart = timeCurrent
      }

      const timeElapsed = timeCurrent - timeStart
      const newPosition = ease(options.easing, timeElapsed, options.start, options.target, options.duration)

      if (!options.allowInvalidPositions && adapter.isPositionOutsideOfElement(newPosition)) {
        return stroll.currentStroll('invalid_position')
      }

      if (!options.ignoreUserScroll && lastPosition && !positionCompare(lastPosition, adapter.getCurrentPosition())) {
        return stroll.currentStroll('user_scrolled')
      }

      if (timeElapsed > options.duration) {
        done(resolve)
      } else {
        adapter.scrollTo(newPosition)
        lastPosition = adapter.getCurrentPosition()
        next()
      }
    }

    function next () {
      animationFrame = window.requestAnimationFrame(loop)
    }

    if (stroll.currentStroll) {
      stroll.currentStroll('new_stroll')
    }

    next()

    stroll.currentStroll = cancelReason => {
      window.cancelAnimationFrame(animationFrame)
      resolve({ wasCancelled: true, cancelReason })
    }

    return stroll.currentStroll
  }

  function done (resolve) {
    stroll.currentStroll = null

    // easing might create small offsets from the requested target
    adapter.scrollTo(positionAdd(options.start, options.target))

    // keyboard navigation might reset the scroll position
    // this sets focus to the element to prevent such problems
    if (options.element && options.focus) {
      if (!options.element.hasAttribute('tabindex')) {
        options.element.setAttribute('tabindex', '-1')
      }

      options.element.focus()
    }

    resolve({ wasCancelled: false })
  }

  return { start: startLoop }
}

function createStroller (adapter) {
  function stroll (target, options = {}) {
    return new Promise((resolve) => {
      const strollOptions = createOptions(stroll.DEFAULTS, options, adapter)
      const offset = resolveOffset(strollOptions.offset, adapter)
      const strollTarget = adapter.resolveTarget(target, strollOptions.start, offset)
      const duration = resolveDuration(strollOptions.duration, positionAbsolute(strollTarget.target))
      const loop = createLoop(stroll, Object.assign({}, strollOptions, strollTarget, {
        duration, offset, adapter
      }))

      loop.start(resolve)
    })
  }

  stroll.currentStroll = null
  stroll.relative = (offset, options = {}) => stroll(null, Object.assign({ offset }, options))
  stroll.DEFAULTS = {}

  return stroll
}

export default createStroller
