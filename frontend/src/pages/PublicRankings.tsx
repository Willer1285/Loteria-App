import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { rankingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Trophy, TrendingUp, Zap, Award, ShoppingBag } from 'lucide-react';

const PublicRankings = () => {
  const [topBuyers, setTopBuyers] = useState<any[]>([]);
  const [topWinners, setTopWinners] = useState<any[]>([]);
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'buyers' | 'winners' | 'spenders'>('buyers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const [buyersRes, winnersRes, spendersRes] = await Promise.all([
        rankingAPI.getTopBuyers({ limit: 20 }),
        rankingAPI.getTopWinners({ limit: 20 }),
        rankingAPI.getTopSpenders({ limit: 20 }),
      ]);

      setTopBuyers(buyersRes.data.ranking);
      setTopWinners(winnersRes.data.ranking);
      setTopSpenders(spendersRes.data.ranking);
    } catch (error) {
      toast.error('Error al cargar rankings');
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-primary-400 to-primary-600';
    }
  };

  const getMedalIcon = (position: number) => {
    if (position <= 3) {
      return <Trophy className="text-white" size={20} />;
    }
    return <span className="text-white font-bold">#{position}</span>;
  };

  const rankings =
    activeTab === 'buyers' ? topBuyers :
    activeTab === 'winners' ? topWinners :
    topSpenders;

  const getCategoryTitle = () => {
    switch (activeTab) {
      case 'buyers':
        return 'Ticket Master';
      case 'winners':
        return 'Campeón';
      case 'spenders':
        return 'Tiburón';
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Award size={40} />
            <h1 className="text-4xl font-bold">Rankings de Jugadores</h1>
          </div>
          <p className="text-primary-100 text-lg">
            Los mejores jugadores de nuestra plataforma - {getCategoryTitle()}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 inline-flex gap-2">
          <button
            onClick={() => setActiveTab('buyers')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'buyers'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag size={20} />
            <span>Ticket Master</span>
          </button>
          <button
            onClick={() => setActiveTab('winners')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'winners'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trophy size={20} />
            <span>Campeón</span>
          </button>
          <button
            onClick={() => setActiveTab('spenders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'spenders'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={20} />
            <span>Tiburón</span>
          </button>
        </div>

        {/* Rankings */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {rankings.map((player, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all ${
                  player.position <= 3 ? 'ring-2 ring-primary-400 ring-offset-2' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Position Badge */}
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMedalColor(player.position)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      {getMedalIcon(player.position)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {player.user.username}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Posición #{player.position} - {getCategoryTitle()}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      {activeTab === 'buyers' ? (
                        <>
                          <p className="text-3xl font-bold text-primary-600">
                            {player.ticketsPurchased}
                          </p>
                          <p className="text-sm text-gray-600">Boletos Comprados</p>
                          <p className="text-sm text-gray-500 mt-1">
                            ${player.totalSpent?.toLocaleString() || '0'} gastados
                          </p>
                        </>
                      ) : activeTab === 'winners' ? (
                        <>
                          <p className="text-3xl font-bold text-green-600">
                            ${player.totalWon?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm text-gray-600">Total Ganado</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {player.ticketsPurchased} boletos jugados
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-orange-600">
                            ${player.totalSpent?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm text-gray-600">Total Gastado</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {player.ticketsPurchased} boletos comprados
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Effects for Top 3 */}
                {player.position <= 3 && (
                  <div className={`h-1 bg-gradient-to-r ${getMedalColor(player.position)}`} />
                )}
              </div>
            ))}

            {rankings.length === 0 && (
              <div className="text-center py-12">
                <Award className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay datos de ranking aún
                </h3>
                <p className="text-gray-600">
                  Los rankings aparecerán cuando los jugadores comiencen a participar
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default PublicRankings;
