"use client"
import * as React from "react"

export type BlueprintInkRevealProps = {
  /** The word drawn as an outline plate and revealed as solid */
  wordmark?: string
  /** Radius of the ink reveal, in screen pixels */
  inkRadius?: number
  /** The drafting-style X/Y readout in the top right */
  showCoordinates?: boolean
  /** Extra root class names */
  className?: string
  /** Background image URL */
  backgroundImage?: string
}

// The ink layer's coordinate space. Pointer positions are converted into it.
const VIEW_W = 1000
const VIEW_H = 300

function drawWordmark(word: string, solid: boolean): string {
  if (typeof document === "undefined") return ""
  const S = 2
  const W = VIEW_W * S
  const H = VIEW_H * S
  const c = document.createElement("canvas")
  c.width = W
  c.height = H
  const x = c.getContext("2d")
  if (!x) return ""

  const text = (word || "BLUEPRINT").toUpperCase()
  const family = "ui-sans-serif, system-ui, Helvetica, Arial, sans-serif"

  const size = Math.round(H * 0.82)
  x.font = "600 " + size + "px " + family
  x.textAlign = "left"
  x.textBaseline = "alphabetic"

  const raw = x.measureText(text)
  const cap = raw.actualBoundingBoxAscent || size * 0.72
  const targetW = W * 0.94
  const sx = targetW / Math.max(1, raw.width)
  const baseline = H / 2 + cap / 2
  const top = baseline - cap
  const left = (W - targetW) / 2

  const px = (unscaled: number) => left + unscaled * sx

  if (solid) {
    x.fillStyle = "#111111"
    x.save()
    x.translate(left, 0)
    x.scale(sx, 1)
    x.fillText(text, 0, baseline)
    x.restore()
    return c.toDataURL("image/png")
  }

  x.save()
  x.translate(left, 0)
  x.scale(sx, 1)
  x.strokeStyle = "#2b2b28"
  x.lineWidth = (1.15 * S) / sx
  x.lineJoin = "miter"
  x.miterLimit = 3
  x.strokeText(text, 0, baseline)
  x.restore()

  const t = 7 * S
  x.lineWidth = 1 * S
  x.strokeStyle = "#2b2b28"
  let cursor = 0
  for (const ch of text) {
    const w = x.measureText(ch).width
    if (ch.trim()) {
      const l = px(cursor)
      const r = px(cursor + w)
      const midX = (l + r) / 2
      const midY = (top + baseline) / 2
      const seg = (x1: number, y1: number, x2: number, y2: number) => {
        x.beginPath()
        x.moveTo(x1, y1)
        x.lineTo(x2, y2)
        x.stroke()
      }
      for (const cx2 of [l, r]) {
        for (const cy2 of [top, baseline]) {
          seg(cx2 - t / 2, cy2, cx2 + t / 2, cy2)
          seg(cx2, cy2 - t / 2, cx2, cy2 + t / 2)
        }
      }
      seg(midX, top - t / 2, midX, top + t / 2)
      seg(midX, baseline - t / 2, midX, baseline + t / 2)
      seg(l - t / 2, midY, l + t / 2, midY)
      seg(r - t / 2, midY, r + t / 2, midY)

      if ("OQCGDU0".includes(ch)) {
        seg(midX - t / 2, midY, midX + t / 2, midY)
        seg(midX, midY - t / 2, midX, midY + t / 2)
      }
    }
    cursor += w
  }

  return c.toDataURL("image/png")
}

function CadCrosshair({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

// Rolling vertical text swap on hover
export default function BlueprintInkReveal({
  wordmark = "BLUEPRINT",
  inkRadius = 150,
  showCoordinates = true,
  className = "",
  backgroundImage = "/images/avatar.png",
}: BlueprintInkRevealProps) {
  // Drawn once per word, on the client. Empty on the server, where there is
  // no canvas; the plates appear on hydration.
  const [plates, setPlates] = React.useState({ frame: "", solid: "" })
  React.useEffect(() => {
    setPlates({ frame: drawWordmark(wordmark, false), solid: drawWordmark(wordmark, true) })
  }, [wordmark])
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [coords, setCoords] = React.useState({ x: 500, y: 150 })
  const [springCoords, setSpringCoords] = React.useState({ x: 500, y: 150 })
  const [currentRadius, setCurrentRadius] = React.useState(0)
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  // Screen pixels per viewBox unit, for turning an inkRadius in px into the
  // mask's own units. Kept in state so the mask re-renders when the box resizes.
  const [viewScale, setViewScale] = React.useState(1)
  const [reducedMotion, setReducedMotion] = React.useState(false)
  const rafId = React.useRef<number | null>(null)

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  React.useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const read = () => {
      const m = svg.getScreenCTM()
      if (m && m.a > 0) setViewScale(m.a)
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(svg)
    window.addEventListener("scroll", read, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", read)
    }
  }, [])

  const toViewBox = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (svg) {
      const m = svg.getScreenCTM()
      if (m) {
        const pt = svg.createSVGPoint()
        pt.x = clientX
        pt.y = clientY
        const p = pt.matrixTransform(m.inverse())
        return { x: p.x, y: p.y }
      }
      const r = svg.getBoundingClientRect()
      const scale = Math.min(r.width / VIEW_W, r.height / VIEW_H) || 1
      return {
        x: (clientX - r.left - (r.width - VIEW_W * scale) / 2) / scale,
        y: (clientY - r.top - (r.height - VIEW_H * scale) / 2) / scale,
      }
    }
    return { x: VIEW_W / 2, y: VIEW_H / 2 }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    setCoords(toViewBox(e.clientX, e.clientY))
    if (!isHovered) setIsHovered(true)
  }

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = toViewBox(e.clientX, e.clientY)
    setCoords(p)
    setSpringCoords(p)
    setIsHovered(true)
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
  }

  const springRef = React.useRef({ x: VIEW_W / 2, y: VIEW_H / 2 })
  const radiusRef = React.useRef(0)
  const coordsRef = React.useRef(coords)
  coordsRef.current = coords

  React.useEffect(() => {
    const targetRadius = isHovered ? inkRadius : 0

    if (reducedMotion) {
      springRef.current = { ...coords }
      radiusRef.current = targetRadius
      setSpringCoords(springRef.current)
      setCurrentRadius(targetRadius)
      return
    }

    const update = () => {
      const target = coordsRef.current
      let moving = false

      const dx = target.x - springRef.current.x
      const dy = target.y - springRef.current.y
      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        springRef.current = {
          x: springRef.current.x + dx * 0.18,
          y: springRef.current.y + dy * 0.18,
        }
        moving = true
      } else if (springRef.current.x !== target.x || springRef.current.y !== target.y) {
        springRef.current = { x: target.x, y: target.y }
        moving = true
      }

      const dr = targetRadius - radiusRef.current
      if (Math.abs(dr) > 0.2) {
        radiusRef.current = radiusRef.current + dr * 0.16
        moving = true
      } else if (radiusRef.current !== targetRadius) {
        radiusRef.current = targetRadius
        moving = true
      }

      if (moving) {
        setSpringCoords(springRef.current)
        setCurrentRadius(radiusRef.current)
        rafId.current = requestAnimationFrame(update)
        return
      }
      rafId.current = null
    }

    rafId.current = requestAnimationFrame(update)
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [coords, isHovered, inkRadius, reducedMotion])

  const filterId = React.useId().replace(/:/g, "_") + "_disp"
  const maskId = React.useId().replace(/:/g, "_") + "_mask"

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative w-full border-y border-[#b3b3af] dark:border-neutral-800 bg-[#f5f5ed] dark:bg-[#121210] overflow-hidden cursor-crosshair select-none ${className}`}
    >
      {/* Background profile image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: "blur(0.5px) brightness(0.25)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* CAD Corner Crosshairs */}
      <div className="absolute top-2 left-2 z-20 text-[#b3b3af] dark:text-neutral-600 pointer-events-none">
        <CadCrosshair />
      </div>
      <div className="absolute top-2 right-2 z-20 text-[#b3b3af] dark:text-neutral-600 pointer-events-none">
        <CadCrosshair />
      </div>
      <div className="absolute bottom-2 left-2 z-20 text-[#b3b3af] dark:text-neutral-600 pointer-events-none">
        <CadCrosshair />
      </div>
      <div className="absolute bottom-2 right-2 z-20 text-[#b3b3af] dark:text-neutral-600 pointer-events-none">
        <CadCrosshair />
      </div>

      {/* Top & Bottom Technical Ruler Tick Marks */}
      <div
        className="absolute top-0 inset-x-8 h-[7px] pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #72726f 0, #72726f 1px, transparent 1px, transparent 18px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-8 h-[7px] pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #72726f 0, #72726f 1px, transparent 1px, transparent 18px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute left-0 inset-y-8 w-[7px] pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #72726f 0, #72726f 1px, transparent 1px, transparent 18px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute right-0 inset-y-8 w-[7px] pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #72726f 0, #72726f 1px, transparent 1px, transparent 18px)",
        }}
        aria-hidden="true"
      />

      {showCoordinates && (
        <div className="absolute top-3.5 right-6 z-20 hidden sm:flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#72726f]/70 dark:text-neutral-500 pointer-events-none">
          <span>X: {Math.round(springCoords.x)}</span>
          <span>•</span>
          <span>Y: {Math.round(springCoords.y)}</span>
        </div>
      )}

      {/* Blueprint Lettering Container */}
      <div className="relative w-full py-8 sm:py-10 md:py-12 px-8 sm:px-14 flex items-center justify-center">
        <div className="w-full">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto block"
            aria-hidden="true"
          >
            <defs>
              {/* Turbulence displacement: what makes the reveal an ink blot, not a circle */}
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.045 0.055"
                  numOctaves="4"
                  seed="5"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="80"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feGaussianBlur stdDeviation="1.6" result="blurred" />
                <feComponentTransfer in="blurred" result="contrast">
                  <feFuncA type="linear" slope="2.5" intercept="-0.65" />
                </feComponentTransfer>
              </filter>

              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW_W} height={VIEW_H}>
                <rect width={VIEW_W} height={VIEW_H} fill="black" />
                <circle
                  cx={springCoords.x}
                  cy={springCoords.y}
                  r={currentRadius / Math.max(0.0001, viewScale)}
                  fill="white"
                  style={{ filter: `url(#${filterId})` }}
                />
              </mask>
            </defs>

            {/* the outline plate */}
            <image
              href={plates.frame}
              x={0}
              y={0}
              width={VIEW_W}
              height={VIEW_H}
              className="dark:invert"
              opacity={0.85}
            />

            {/* the solid letters, uncovered by the ink blot */}
            <image
              href={plates.solid}
              x={0}
              y={0}
              width={VIEW_W}
              height={VIEW_H}
              mask={`url(#${maskId})`}
              className="dark:invert"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}