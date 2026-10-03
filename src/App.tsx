import { Navigate, Route, Routes } from 'react-router-dom'
import RoleSelect from './routes/RoleSelect'
import SeniorToday from './routes/senior/Today'
import SeniorHelp from './routes/senior/Help'
import CaregiverLayout from './routes/caregiver/Layout'
import Dashboard from './routes/caregiver/Dashboard'
import Medications from './routes/caregiver/Medications'
import Calendar from './routes/caregiver/Calendar'
import Doctors from './routes/caregiver/Doctors'
import Programs from './routes/caregiver/Programs'
import SplitView from './routes/demo/SplitView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/senior" element={<SeniorToday />} />
      <Route path="/senior/pomoc" element={<SeniorHelp />} />
      <Route path="/opiekun" element={<CaregiverLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="leki" element={<Medications />} />
        <Route path="kalendarz" element={<Calendar />} />
        <Route path="lekarze" element={<Doctors />} />
        <Route path="programy" element={<Programs />} />
      </Route>
      <Route path="/demo" element={<SplitView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
