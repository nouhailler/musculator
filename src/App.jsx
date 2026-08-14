import { useApp } from './state/context.js';
import OfflineBanner from './components/OfflineBanner.jsx';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import TabBar from './components/TabBar.jsx';
import Home from './screens/Home.jsx';
import Programs from './screens/Programs.jsx';
import Library from './screens/Library.jsx';
import Journal from './screens/Journal.jsx';
import Nutrition from './screens/Nutrition.jsx';
import Progress from './screens/Progress.jsx';
import ExerciseDetail from './overlays/ExerciseDetail.jsx';
import ProgramDetail from './overlays/ProgramDetail.jsx';
import BodyMap from './overlays/BodyMap.jsx';
import Profile from './overlays/Profile.jsx';
import Builder from './overlays/Builder.jsx';
import FoodSearch from './overlays/FoodSearch.jsx';
import FoodEntry from './overlays/FoodEntry.jsx';
import Workout from './overlays/Workout.jsx';
import WorkoutComplete from './overlays/WorkoutComplete.jsx';

const TAB_SCREENS = { home: Home, programs: Programs, library: Library, nutrition: Nutrition, journal: Journal, progress: Progress };
const OVERLAYS = {
  exercise: ExerciseDetail, program: ProgramDetail, bodymap: BodyMap, profile: Profile,
  builder: Builder, foodSearch: FoodSearch, foodEntry: FoodEntry,
};

export default function App() {
  const { state } = useApp();
  const Screen = TAB_SCREENS[state.tab] || Home;
  const Overlay = OVERLAYS[state.view];

  return (
    <div className="app-shell">
      <div className="app">
        <OfflineBanner />
        {!state.view && <Screen />}
        {Overlay && <Overlay />}
        {state.view === 'workout' && <Workout />}
        {state.view === 'complete' && <WorkoutComplete />}
        <TabBar />
        <DisclaimerModal />
      </div>
    </div>
  );
}
