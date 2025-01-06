import { Drag } from './util/Drag';
import Layout from 'routes/Layout';
import { useGlobalStyles } from './theme/stitches.config';
import useTheme from 'hooks/useColorTheme';
import { CoreModuleProvider } from 'contexts/coreContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ErrorBoundary from 'exception/ErrorBoundary';

export default function App() {
  useGlobalStyles();
  const { theme } = useTheme();

  return (
    <div className={`App ${theme}`}>
      <ErrorBoundary css={{ w: '100vw', h: '100vh' }}>
        <CoreModuleProvider>
          <DndProvider backend={HTML5Backend}>
            <Drag.DragLayer />
            <Layout />
          </DndProvider>
        </CoreModuleProvider>
      </ErrorBoundary>
    </div>
  );
}
