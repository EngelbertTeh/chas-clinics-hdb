import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// I have hardcoded the values because I am not connecting it to any online database
const healthcareData = [
  {
    town: "CT",
    totalResidents: 37190.7,
    accessibleResidents: 37190.7,
    clinics: 108,
    accessibility: 100.0,
    avgResidents: 344.36,
  },
  {
    town: "BT",
    totalResidents: 7917.4,
    accessibleResidents: 7917.4,
    clinics: 21,
    accessibility: 100.0,
    avgResidents: 377.02,
  },
  {
    town: "MP",
    totalResidents: 24350.5,
    accessibleResidents: 24350.5,
    clinics: 14,
    accessibility: 100.0,
    avgResidents: 1739.32,
  },
  {
    town: "KWN",
    totalResidents: 128975.5,
    accessibleResidents: 128516.7,
    clinics: 71,
    accessibility: 99.64,
    avgResidents: 1810.09,
  },
  {
    town: "QT",
    totalResidents: 108258.2,
    accessibleResidents: 103791.1,
    clinics: 43,
    accessibility: 95.87,
    avgResidents: 2413.75,
  },
  {
    town: "GL",
    totalResidents: 106348.6,
    accessibleResidents: 105542.6,
    clinics: 43,
    accessibility: 99.24,
    avgResidents: 2454.48,
  },
  {
    town: "SGN",
    totalResidents: 67056.1,
    accessibleResidents: 66684.1,
    clinics: 27,
    accessibility: 99.45,
    avgResidents: 2469.78,
  },
  {
    town: "AMK",
    totalResidents: 161634.0,
    accessibleResidents: 161634.0,
    clinics: 64,
    accessibility: 100.0,
    avgResidents: 2525.53,
  },
  {
    town: "BD",
    totalResidents: 199683.4,
    accessibleResidents: 199683.4,
    clinics: 79,
    accessibility: 100.0,
    avgResidents: 2527.64,
  },
  {
    town: "PRC",
    totalResidents: 91927.4,
    accessibleResidents: 85916.5,
    clinics: 32,
    accessibility: 93.46,
    avgResidents: 2684.89,
  },
  {
    town: "CL",
    totalResidents: 89010.3,
    accessibleResidents: 87280.5,
    clinics: 32,
    accessibility: 98.06,
    avgResidents: 2727.52,
  },
  {
    town: "TP",
    totalResidents: 144959.1,
    accessibleResidents: 136768.9,
    clinics: 50,
    accessibility: 94.35,
    avgResidents: 2735.38,
  },
  {
    town: "BM",
    totalResidents: 167868.1,
    accessibleResidents: 164092.3,
    clinics: 59,
    accessibility: 97.75,
    avgResidents: 2781.23,
  },
  {
    town: "BH",
    totalResidents: 60995.6,
    accessibleResidents: 57210.5,
    clinics: 20,
    accessibility: 93.79,
    avgResidents: 2860.53,
  },
  {
    town: "JE",
    totalResidents: 74778.2,
    accessibleResidents: 74778.2,
    clinics: 26,
    accessibility: 100.0,
    avgResidents: 2876.08,
  },
  {
    town: "TAP",
    totalResidents: 261122.3,
    accessibleResidents: 244574.5,
    clinics: 81,
    accessibility: 93.66,
    avgResidents: 3019.44,
  },
  {
    town: "HG",
    totalResidents: 181957.6,
    accessibleResidents: 179452.8,
    clinics: 55,
    accessibility: 98.62,
    avgResidents: 3262.78,
  },
  {
    town: "BB",
    totalResidents: 146177.4,
    accessibleResidents: 144286.4,
    clinics: 42,
    accessibility: 98.71,
    avgResidents: 3435.39,
  },
  {
    town: "YS",
    totalResidents: 218822.8,
    accessibleResidents: 218385.7,
    clinics: 61,
    accessibility: 99.8,
    avgResidents: 3580.09,
  },
  {
    town: "JW",
    totalResidents: 237394.9,
    accessibleResidents: 232890.6,
    clinics: 60,
    accessibility: 98.1,
    avgResidents: 3881.51,
  },
  {
    town: "CCK",
    totalResidents: 155530.1,
    accessibleResidents: 137853.9,
    clinics: 34,
    accessibility: 88.63,
    avgResidents: 4054.53,
  },
  {
    town: "WL",
    totalResidents: 226355.8,
    accessibleResidents: 224164.1,
    clinics: 47,
    accessibility: 99.03,
    avgResidents: 4769.45,
  },
  {
    town: "BP",
    totalResidents: 115003.8,
    accessibleResidents: 113484.8,
    clinics: 22,
    accessibility: 98.68,
    avgResidents: 5158.4,
  },
  {
    town: "SK",
    totalResidents: 236421.5,
    accessibleResidents: 233870.2,
    clinics: 44,
    accessibility: 98.92,
    avgResidents: 5315.23,
  },
  {
    town: "PG",
    totalResidents: 196121.5,
    accessibleResidents: 165031.6,
    clinics: 29,
    accessibility: 84.15,
    avgResidents: 5690.74,
  },
  {
    town: "SB",
    totalResidents: 98570.7,
    accessibleResidents: 97656.2,
    clinics: 17,
    accessibility: 99.07,
    avgResidents: 5744.48,
  },
  { town: "TG", totalResidents: 36462.2, accessibleResidents: 0.0, clinics: 0, accessibility: 0.0, avgResidents: 0 },
]

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num)
}

function getAccessibilityBadge(percentage: number) {
  if (percentage >= 99) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
  if (percentage >= 95) return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good</Badge>
  if (percentage >= 90) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Fair</Badge>
  if (percentage > 0) return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Poor</Badge>
  return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No Access</Badge>
}

export default function Dashboard() {
  const totalResidents = healthcareData.reduce((sum, item) => sum + item.totalResidents, 0)
  const totalAccessibleResidents = healthcareData.reduce((sum, item) => sum + item.accessibleResidents, 0)
  const totalClinics = healthcareData.reduce((sum, item) => sum + item.clinics, 0)
  const overallAccessibility = totalResidents > 0 ? (totalAccessibleResidents / totalResidents) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Accessibility Dashboard</h1>
          <p className="text-gray-600">Clinic accessibility within 500m radius by town</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalResidents)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Accessible Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatNumber(totalAccessibleResidents)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Clinics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalClinics.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{formatNumber(overallAccessibility)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Healthcare Accessibility by Town</CardTitle>
            <CardDescription>
              Detailed breakdown of clinic accessibility within 500m radius for each town
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Town</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Residents</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Accessible Residents</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Clinics</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Accessibility</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Residents/Clinic</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {healthcareData.map((item, index) => (
                    <tr
                      key={item.town}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-semibold text-gray-900">{item.town}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatNumber(item.totalResidents)}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            item.accessibleResidents >= item.totalResidents
                              ? "text-green-600 font-semibold"
                              : "text-blue-600"
                          }
                        >
                          {formatNumber(item.accessibleResidents)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{item.clinics.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {formatNumber(item.accessibility)}%
                            </span>
                          </div>
                          <Progress value={item.accessibility} className="h-2" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatNumber(item.avgResidents)}</td>
                      <td className="py-3 px-4 text-center">{getAccessibilityBadge(item.accessibility)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
