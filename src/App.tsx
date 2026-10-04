import { Navigate, Route, Routes } from 'react-router-dom'
import RoleSelect from './routes/RoleSelect'
import SeniorToday from './routes/senior/Today'
import SeniorHelp from './routes/senior/Help'
import SeniorAddMedication from './routes/senior/AddMedication'
import SeniorCalendar from './routes/senior/Calendar'
import SeniorVisits from './routes/senior/Visits'
import SeniorTests from './routes/senior/Tests'
import SeniorDoctors from './routes/senior/Doctors'
import CaregiverLayout from './routes/caregiver/Layout'
import Dashboard from './routes/caregiver/Dashboard'
import Medications from './routes/caregiver/Medications'
import Calendar from './routes/caregiver/Calendar'
import Doctors from './routes/caregiver/Doctors'
import Programs from './routes/caregiver/Programs'
import Referrals from './routes/caregiver/Referrals'
import Tests from './routes/caregiver/Tests'
import Documents from './routes/caregiver/Documents'
import Visits from './routes/caregiver/Visits'
import SplitView from './routes/demo/SplitView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/senior" element={<SeniorToday />} />
      <Route path="/senior/pomoc" element={<SeniorHelp />} />
      <Route path="/senior/dodaj-lek" element={<SeniorAddMedication />} />
      <Route path="/senior/kalendarz" element={<SeniorCalendar />} />
      <Route path="/senior/wizyty" element={<SeniorVisits />} />
      <Route path="/senior/badania" element={<SeniorTests />} />
      <Route path="/senior/lekarze" element={<SeniorDoctors />} />
      <Route path="/opiekun" element={<CaregiverLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="leki" element={<Medications />} />
        <Route path="kalendarz" element={<Calendar />} />
        <Route path="lekarze" element={<Doctors />} />
        <Route path="programy" element={<Programs />} />
        <Route path="skierowania" element={<Referrals />} />
        <Route path="badania" element={<Tests />} />
        <Route path="dokumenty" element={<Documents />} />
        <Route path="wizyty" element={<Visits />} />
      </Route>
      <Route path="/demo" element={<SplitView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
