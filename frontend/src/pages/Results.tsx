import { useEffect, useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { lotteryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Trophy, Calendar, DollarSign, Users, Award } from 'lucide-react';

const Results = () => {
  const [completedLotteries, setCompletedLotteries] = useState<any[]>([]);
  const [selectedLottery, setSelectedLottery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletedLotteries();
  }, []);

  const loadCompletedLotteries = async () => {
    try {
      const response = await lotteryAPI.getAll({ status: 'completed', limit: 50 });
      setCompletedLotteries(response.data.lotteries);
    } catch (error) {
      toast.error('Error al cargar resultados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={40} />
            <h1 className="text-4xl font-bold">Resultados de Sorteos</h1>
          </div>
          <p className="text-primary-100 text-lg">
            Consulta los ganadores de todos nuestros sorteos completados
          </p>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {completedLotteries.map((lottery) => (
              <div
                key={lottery._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{lottery.name}</h2>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                          Completado
                        </span>
                      </div>
                      <p className="text-gray-600">{lottery.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Calendar className="text-primary-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Fecha del Sorteo</p>
                        <p className="font-semibold">
                          {new Date(lottery.drawDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <DollarSign className="text-green-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Premio Total</p>
                        <p className="font-semibold text-green-600">
                          ${lottery.totalPrize.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Users className="text-blue-600" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">Boletos Vendidos</p>
                        <p className="font-semibold">{lottery.soldTickets}</p>
                      </div>
                    </div>
                  </div>

                  {/* Winning Numbers */}
                  {lottery.winningNumbers && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-500 mb-2">Números Ganadores:</p>
                      <div className="flex flex-wrap gap-2">
                        {lottery.winningNumbers.map((num: number, idx: number) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-bold flex items-center justify-center text-lg shadow-lg"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Winners */}
                  {lottery.winners && lottery.winners.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Award className="text-yellow-500" size={20} />
                        <p className="text-sm font-medium text-gray-500">Ganadores:</p>
                      </div>
                      <div className="space-y-2">
                        {lottery.winners.map((winner: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-yellow-500 text-white font-bold flex items-center justify-center">
                                {winner.position}°
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Posición {winner.position}</p>
                                <p className="text-sm text-gray-600">Ticket #{winner.ticketId?.toString().slice(-8)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                ${winner.prize.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {completedLotteries.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay sorteos completados
                </h3>
                <p className="text-gray-600">
                  Los resultados aparecerán aquí una vez que los sorteos finalicen
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default Results;
