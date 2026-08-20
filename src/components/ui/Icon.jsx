// Explicit, named imports only — this app uses a fixed icon set pulled from
// data files (src/data/*.js) and inline props, so importing `* as Phosphor`
// and resolving by string would defeat tree-shaking and pull in the entire
// (multi-thousand icon) library. Add new slugs here when new icons are used.
import {
  ArrowBendDownLeft, ArrowBendUpRight, ArrowCircleRight, ArrowCounterClockwise,
  ArrowFatLinesDown, ArrowLeft, ArrowsDownUp, ArrowsIn, ArrowsInLineHorizontal, ArrowsOut,
  Barcode, CaretLeft, Copy, Cookie, ForkKnife, Leaf, List, Question, Sun, SunHorizon,
  Barbell, Books, CalendarBlank, CaretDown, CaretRight, CaretUp, ChartLineUp, Check,
  CheckCircle, CheckFat, Circle, CircleNotch, Clock, ClockCounterClockwise, CloudSlash,
  CrownSimple, Drop, Fire, Flag, FlagCheckered, Flame, FloppyDisk, GearSix, Heartbeat,
  House, HouseLine, Info, Lightning, LineSegment, ListChecks, MagnifyingGlass, Medal,
  Moon, MoonStars, Mountains, NotePencil, Notebook, Pause, PencilSimple, Person,
  PersonSimple, PersonSimpleHike, PersonSimpleTaiChi, PersonSimpleWalk, Play, PlayCircle,
  Plus, PlusCircle, Scales, ShieldCheck, SkipForward, SneakerMove, Sparkle, SpeakerHigh,
  SpeakerSimpleX, Target, ThermometerHot, Timer, Trash, TrendUp, Trophy, UserGear,
  WarningCircle, Waveform, Wind, Wrench, X, XCircle,
} from '@phosphor-icons/react';

const REGISTRY = {
  'arrow-bend-down-left': ArrowBendDownLeft, 'arrow-bend-up-right': ArrowBendUpRight,
  'arrow-circle-right': ArrowCircleRight, 'arrow-counter-clockwise': ArrowCounterClockwise,
  'arrow-fat-lines-down': ArrowFatLinesDown, 'arrow-left': ArrowLeft,
  'arrows-down-up': ArrowsDownUp, 'arrows-in': ArrowsIn,
  'arrows-in-line-horizontal': ArrowsInLineHorizontal, 'arrows-out': ArrowsOut,
  barbell: Barbell, barcode: Barcode, books: Books, 'calendar-blank': CalendarBlank,
  'caret-down': CaretDown, 'caret-left': CaretLeft, cookie: Cookie, copy: Copy,
  'fork-knife': ForkKnife, leaf: Leaf, list: List, question: Question,
  sun: Sun, 'sun-horizon': SunHorizon,
  scales: Scales,
  'caret-right': CaretRight, 'caret-up': CaretUp, 'chart-line-up': ChartLineUp, check: Check,
  'check-circle': CheckCircle, 'check-fat': CheckFat, circle: Circle,
  'circle-notch': CircleNotch,
  clock: Clock, 'clock-counter-clockwise': ClockCounterClockwise, 'cloud-slash': CloudSlash,
  'crown-simple': CrownSimple, drop: Drop, fire: Fire, flag: Flag,
  'flag-checkered': FlagCheckered, flame: Flame, 'floppy-disk': FloppyDisk,
  'gear-six': GearSix, heartbeat: Heartbeat, house: House, 'house-line': HouseLine,
  info: Info, lightning: Lightning, 'line-segment': LineSegment, 'list-checks': ListChecks,
  'magnifying-glass': MagnifyingGlass, medal: Medal, moon: Moon, 'moon-stars': MoonStars,
  mountains: Mountains, 'note-pencil': NotePencil, notebook: Notebook, pause: Pause,
  'pencil-simple': PencilSimple, person: Person, 'person-simple': PersonSimple,
  'person-simple-hike': PersonSimpleHike, 'person-simple-tai-chi': PersonSimpleTaiChi,
  'person-simple-walk': PersonSimpleWalk, play: Play, 'play-circle': PlayCircle,
  plus: Plus, 'plus-circle': PlusCircle, 'shield-check': ShieldCheck,
  'skip-forward': SkipForward, 'sneaker-move': SneakerMove, sparkle: Sparkle,
  'speaker-high': SpeakerHigh, 'speaker-simple-x': SpeakerSimpleX, target: Target,
  'thermometer-hot': ThermometerHot, timer: Timer, trash: Trash, 'trend-up': TrendUp,
  trophy: Trophy, 'user-gear': UserGear, 'warning-circle': WarningCircle,
  waveform: Waveform, wind: Wind, wrench: Wrench, x: X, 'x-circle': XCircle,
};

// name: kebab-case Phosphor slug (e.g. "barbell", "person-simple-walk") —
// matches the icon keys used throughout src/data/*.
export default function Icon({ name, weight = 'regular', size = 20, color, style, className }) {
  const Cmp = REGISTRY[name] || Circle;
  return <Cmp weight={weight} size={size} color={color} style={style} className={className} />;
}
