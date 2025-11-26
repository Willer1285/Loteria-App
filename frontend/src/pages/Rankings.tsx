import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { rankingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Trophy, ShoppingBag, TrendingUp } from 'lucide-react';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState<'buyers' | 'winners' | 'spenders'>('buyers');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, [activeTab]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'buyers':
          response = await rankingAPI.getTopBuyers(10);
          break;
        case 'winners':
          response = await rankingAPI.getTopWinners(10);
          break;
        case 'spenders':
          response = await rankingAPI.getTopSpenders(10);
          break;
      }
      setRankings(response.data.ranking);
    } catch (error) {
      toast.error('Error al cargar rankings');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rankings</h1>
          <p className="text-gray-600 mt-1">
            Los mejores jugadores de la comunidad
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'buyers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={20} />
            <span>Más Boletos</span>
          </button>

          <button
            onClick={() => setActiveTab('winners')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'winners'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Trophy size={20} />
            <span>Más Ganadores</span>
          </button>

          <button
            onClick={() => setActiveTab('spenders')}
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
              activeTab === 'spenders'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={20} />
            <span>Más Gastado</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Posición
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Jugador
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    {activeTab === 'buyers'
                      ? 'Boletos Comprados'
                      : activeTab === 'winners'
                      ? 'Total Ganado'
                      : 'Total Gastado'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rankings.map((item) => (
                  <tr key={item.position} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Trophy
                          className={getMedalColor(item.position)}
                          size={20}
                        />
                        <span className="font-semibold text-gray-900">
                          #{item.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {item.user.username}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {activeTab === 'buyers'
                          ? item.ticketsPurchased
                          : activeTab === 'winners'
                          ? `$${item.totalWon?.toFixed(2)}`
                          : `$${item.totalSpent?.toFixed(2)}`}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rankings.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No hay datos de ranking disponibles
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Rankings;
