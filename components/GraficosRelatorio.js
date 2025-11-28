import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function GraficoBlocosDistribuidos({ blocos }) {
    // Calcular estatísticas dos blocos
    const blocosDisponiveis = blocos.filter(b => b.status === 'disponivel').length;
    const blocosDistribuidos = blocos.filter(b => b.status === 'distribuido').length;
    const blocosRecolhidos = blocos.filter(b => b.status === 'recolhido').length;

    const data = [
        { name: 'Disponíveis', value: blocosDisponiveis, color: '#3B82F6' },
        { name: 'Distribuídos', value: blocosDistribuidos, color: '#10B981' },
        { name: 'Recolhidos', value: blocosRecolhidos, color: '#6B7280' }
    ];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent === 0) return null;

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-bold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800">{payload[0].name}</p>
                    <p className="text-sm text-gray-600">
                        Quantidade: <span className="font-bold">{payload[0].value}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                        Percentual: <span className="font-bold">{((payload[0].value / blocos.length) * 100).toFixed(1)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">📊 Distribuição de Blocos</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 mb-1">Disponíveis</p>
                    <p className="text-3xl font-bold text-blue-600">{blocosDisponiveis}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {((blocosDisponiveis / blocos.length) * 100).toFixed(1)}% do total
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-gray-600 mb-1">Distribuídos</p>
                    <p className="text-3xl font-bold text-green-600">{blocosDistribuidos}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {((blocosDistribuidos / blocos.length) * 100).toFixed(1)}% do total
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                    <p className="text-sm text-gray-600 mb-1">Recolhidos</p>
                    <p className="text-3xl font-bold text-gray-600">{blocosRecolhidos}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {((blocosRecolhidos / blocos.length) * 100).toFixed(1)}% do total
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry) => (
                                <span className="text-sm font-medium text-gray-700">
                                    {value} ({entry.payload.value})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function GraficoBilhetesVendidos({ rifa, blocos, bilhetes }) {
    // Calcular bilhetes por vendedor com dados reais de vendas
    const vendedoresMap = new Map();

    // Agrupar bilhetes por vendedor
    bilhetes.forEach(bilhete => {
        if (bilhete.vendedor_id) {
            const vendedorId = bilhete.vendedor_id;

            if (!vendedoresMap.has(vendedorId)) {
                // Encontrar o nome do vendedor através dos blocos
                const blocoDoVendedor = blocos.find(b => b.vendedor_id === vendedorId);

                vendedoresMap.set(vendedorId, {
                    id: vendedorId,
                    nome: blocoDoVendedor?.vendedor_nome || 'Vendedor Desconhecido',
                    telefone: blocoDoVendedor?.vendedor_telefone || '',
                    totalDistribuido: 0,
                    vendidosPagos: 0,
                    vendidosPendentes: 0,
                    naoVendidos: 0
                });
            }

            const vendedorData = vendedoresMap.get(vendedorId);
            vendedorData.totalDistribuido += 1;

            if (bilhete.status_venda === 'pago' || bilhete.status_venda === 'confirmado') {
                vendedorData.vendidosPagos += 1;
            } else if (bilhete.status_venda === 'pendente') {
                vendedorData.vendidosPendentes += 1;
            } else {
                vendedorData.naoVendidos += 1;
            }
        }
    });

    const vendedoresData = Array.from(vendedoresMap.values())
        .map(v => ({
            ...v,
            totalVendidos: v.vendidosPagos + v.vendidosPendentes,
            percentualVendido: ((v.vendidosPagos + v.vendidosPendentes) / v.totalDistribuido * 100).toFixed(1)
        }))
        .sort((a, b) => b.totalVendidos - a.totalVendidos);

    // Calcular totais gerais
    const totalBilhetes = rifa.qtde_bilhetes;
    const bilhetesDistribuidos = bilhetes.filter(b => b.vendedor_id !== null).length;
    const bilhetesVendidosPagos = bilhetes.filter(b => b.status_venda === 'pago' || b.status_venda === 'confirmado').length;
    const bilhetesVendidosPendentes = bilhetes.filter(b => b.status_venda === 'pendente').length;
    const totalVendidos = bilhetesVendidosPagos + bilhetesVendidosPendentes;
    const bilhetesDisponiveis = totalBilhetes - bilhetesDistribuidos;

    const CustomTooltipBar = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-bold text-gray-800 mb-2">{data.nome}</p>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-600">
                            <span className="font-semibold text-green-600">Vendidos (Pagos):</span> {data.vendidosPagos}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold text-yellow-600">Vendidos (Pendentes):</span> {data.vendidosPendentes}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold text-red-600">Não Vendidos:</span> {data.naoVendidos}
                        </p>
                        <div className="border-t pt-1 mt-1">
                            <p className="font-semibold text-gray-800">
                                Total Distribuído: {data.totalDistribuido}
                            </p>
                            <p className="font-semibold text-blue-600">
                                Taxa de Venda: {data.percentualVendido}%
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card">
            <h2 className="text-xl font-bold mb-4">🎫 Bilhetes Vendidos</h2>

            {/* Resumo Geral */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">Total de Bilhetes</p>
                    <p className="text-3xl font-bold text-blue-900">{totalBilhetes.toLocaleString('pt-BR')}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-700 mb-1">Distribuídos</p>
                    <p className="text-3xl font-bold text-purple-900">{bilhetesDistribuidos.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-purple-600 mt-1">
                        {((bilhetesDistribuidos / totalBilhetes) * 100).toFixed(1)}% do total
                    </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 mb-1">Vendidos (Pagos)</p>
                    <p className="text-3xl font-bold text-green-900">{bilhetesVendidosPagos.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-green-600 mt-1">
                        {((bilhetesVendidosPagos / totalBilhetes) * 100).toFixed(1)}% do total
                    </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-700 mb-1">Vendidos (Pendentes)</p>
                    <p className="text-3xl font-bold text-yellow-900">{bilhetesVendidosPendentes.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                        {((bilhetesVendidosPendentes / totalBilhetes) * 100).toFixed(1)}% do total
                    </p>
                </div>
            </div>

            {/* Barra de Progresso Geral */}
            <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700">Progresso de Vendas</p>
                    <p className="text-sm font-bold text-gray-900">
                        {totalVendidos} / {totalBilhetes} ({((totalVendidos / totalBilhetes) * 100).toFixed(1)}%)
                    </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div className="h-4 flex">
                        <div
                            className="bg-green-500 transition-all duration-500"
                            style={{ width: `${(bilhetesVendidosPagos / totalBilhetes * 100)}%` }}
                            title={`Pagos: ${bilhetesVendidosPagos}`}
                        ></div>
                        <div
                            className="bg-yellow-400 transition-all duration-500"
                            style={{ width: `${(bilhetesVendidosPendentes / totalBilhetes * 100)}%` }}
                            title={`Pendentes: ${bilhetesVendidosPendentes}`}
                        ></div>
                    </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Pagos</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                        <span className="text-gray-600">Pendentes</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <span className="text-gray-600">Disponíveis</span>
                    </div>
                </div>
            </div>

            {/* Gráfico de Barras por Vendedor */}
            {vendedoresData.length > 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Bilhetes por Vendedor</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={vendedoresData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="nome"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltipBar />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                                iconType="square"
                            />
                            <Bar
                                dataKey="vendidosPagos"
                                name="Vendidos (Pagos)"
                                stackId="a"
                                fill="#10B981"
                                radius={[0, 0, 0, 0]}
                            />
                            <Bar
                                dataKey="vendidosPendentes"
                                name="Vendidos (Pendentes)"
                                stackId="a"
                                fill="#FBBF24"
                                radius={[0, 0, 0, 0]}
                            />
                            <Bar
                                dataKey="naoVendidos"
                                name="Não Vendidos"
                                stackId="a"
                                fill="#EF4444"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <p className="text-yellow-800 font-medium">
                        ⚠️ Nenhum bloco foi distribuído ainda
                    </p>
                    <p className="text-sm text-yellow-600 mt-2">
                        Atribua blocos aos vendedores para visualizar as estatísticas de vendas
                    </p>
                </div>
            )}

            {/* Tabela de Vendedores */}
            {vendedoresData.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Detalhamento por Vendedor</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left p-3 font-semibold text-gray-700">Posição</th>
                                    <th className="text-left p-3 font-semibold text-gray-700">Vendedor</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Distribuídos</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Vendidos</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Pagos</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Pendentes</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Não Vendidos</th>
                                    <th className="text-center p-3 font-semibold text-gray-700">Taxa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendedoresData.map((vendedor, index) => (
                                    <tr key={vendedor.id} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-50 text-blue-800'
                                                }`}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <p className="font-medium text-gray-800">{vendedor.nome}</p>
                                            {vendedor.telefone && (
                                                <p className="text-xs text-gray-500">{vendedor.telefone}</p>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                                                {vendedor.totalDistribuido}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                                                {vendedor.totalVendidos}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                                                {vendedor.vendidosPagos}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
                                                {vendedor.vendidosPendentes}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">
                                                {vendedor.naoVendidos}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-gray-900">{vendedor.percentualVendido}%</span>
                                                <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${vendedor.percentualVendido}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
