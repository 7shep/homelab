import { StyleSheet, View } from 'react-native';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './screens/Dashboard';
import { Placeholder } from './screens/Placeholder';
import { ProjectsList } from './screens/ProjectsList';
import { ProjectDetail } from './screens/ProjectDetail';
import { ProjectForm } from './screens/ProjectForm';
import { colors } from './theme';

export default function App() {
  return (
    <BrowserRouter>
      <View style={styles.app}>
        <Sidebar />
        <View style={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsList />} />
            <Route path="/projects/new" element={<ProjectForm mode="create" />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectForm mode="edit" />} />
            <Route path="/timeline" element={<Placeholder title="Timeline" />} />
            <Route path="/alerts" element={<Placeholder title="Alerts" />} />
            <Route path="/servers" element={<Placeholder title="Servers" />} />
            <Route path="/config" element={<Placeholder title="Config" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </View>
      </View>
    </BrowserRouter>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.app,
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: '100vh'
  },
  content: { flex: 1, minWidth: 360 }
});
