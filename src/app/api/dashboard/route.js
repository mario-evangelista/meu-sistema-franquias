import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/dashboard - Retorna dados do dashboard
export async function GET() {
  try {
    // ==========================================
    // PASSO 1: BUSCAR OS DADOS DO BANCO
    // ==========================================
    console.log('📊 Buscando dados do banco...')

    // Buscar TODAS as franquias E seus funcionários de uma vez
    const franquias = await prisma.franquia.findMany({
      include: {
        funcionarios: true  // Traz os funcionários junto!
      },
      orderBy: {
        createdAt: 'desc'  // Mais recentes primeiro
      }
    })

    // Buscar TODOS os funcionários E suas franquias
    const funcionarios = await prisma.funcionario.findMany({
      include: {
        franquia: {
          select: { nome: true }  // Só preciso do nome da franquia
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // ==========================================
    // PASSO 2: CALCULAR OS TOTAIS BÁSICOS
    // ==========================================
    const totalFuncionarios = funcionarios.length

    /*let somaSalarios = 0
    funcionarios.forEach(f => {
      somaSalarios += f.salario
    })*/

      let somaSalarios = 0
funcionarios.forEach(f => {
  somaSalarios += Number(f.salario) || 0
})


    const salarioMedio = totalFuncionarios > 0 ? somaSalarios / totalFuncionarios : 0


    // ==========================================
    // PASSO 3: AGRUPAR POR CATEGORIAS
    // ==========================================
    console.log('📦 Agrupando dados...')

    // Franquias por cidade
    const cidades = []
    franquias.forEach(f => {
      const existe = cidades.find(c => c.cidade === f.cidade)
      if (existe) {
        existe.total++
      } else {
        cidades.push({ cidade: f.cidade, total: 1 })
      }
    })
    cidades.sort((a, b) => b.total - a.total)

    // Funcionários por cargo
    const cargos = []
    funcionarios.forEach(f => {
      const existe = cargos.find(c => c.cargo === f.cargo)
      if (existe) {
        existe.total++
      } else {
        cargos.push({ cargo: f.cargo, total: 1 })
      }
    })
    cargos.sort((a, b) => b.total - a.total)

    // Faixas salariais
    let ate2k = 0, de2a4k = 0, de4a6k = 0, de6a8k = 0, acima8k = 0

    funcionarios.forEach(f => {
      if (f.salario <= 2000) ate2k++
      else if (f.salario <= 4000) de2a4k++
      else if (f.salario <= 6000) de4a6k++
      else if (f.salario <= 8000) de6a8k++
      else acima8k++
    })

    const faixasSalariais = [
      { faixa: 'Até R$ 2.000', quantidade: ate2k },
      { faixa: 'R$ 2.001 - R$ 4.000', quantidade: de2a4k },
      { faixa: 'R$ 4.001 - R$ 6.000', quantidade: de4a6k },
      { faixa: 'R$ 6.001 - R$ 8.000', quantidade: de6a8k },
      { faixa: 'Acima de R$ 8.000', quantidade: acima8k }
    ]

    // ==========================================
    // PASSO 4: CRIAR RANKINGS E LISTAS
    // ==========================================
    console.log('🏆 Montando rankings...')

    const todasFranquias = []
    franquias.forEach(f => {
      let folha = 0
      f.funcionarios.forEach(func => {
        folha += func.salario
      })

      todasFranquias.push({
        id: f.id,
        nome: f.nome,
        cidade: f.cidade,
        totalFuncionarios: f.funcionarios.length,
        folhaSalarial: Math.round(folha * 100) / 100
      })
    })

    todasFranquias.sort((a, b) => b.totalFuncionarios - a.totalFuncionarios)
    const top5 = todasFranquias.slice(0, 5)

    const ultimas5Franquias = franquias.slice(0, 5).map(f => ({
      id: f.id,
      nome: f.nome,
      cidade: f.cidade,
      totalFuncionarios: f.funcionarios.length,
      createdAt: f.createdAt
    }))

    const ultimos5Funcionarios = funcionarios.slice(0, 5).map(f => ({
      id: f.id,
      nome: f.nome,
      cargo: f.cargo,
      salario: f.salario,
      franquia: f.franquia?.nome || 'Sem franquia',
      createdAt: f.createdAt
    }))

    // ==========================================
    // PASSO 5: IDENTIFICAR ALERTAS/PROBLEMAS
    // ==========================================
    console.log('⚠️ Verificando alertas...')

    const franquiasSemFuncionarios = []
    franquias.forEach(f => {
      if (f.funcionarios.length === 0) {
        franquiasSemFuncionarios.push({
          id: f.id,
          nome: f.nome,
          cidade: f.cidade,
          createdAt: f.createdAt
        })
      }
    })

    const funcionariosSemFranquia = []
    funcionarios.forEach(f => {
      if (!f.franquia) {
        funcionariosSemFranquia.push({
          id: f.id,
          nome: f.nome,
          cargo: f.cargo,
          salario: f.salario,
          createdAt: f.createdAt
        })
      }
    })

    // ==========================================
    // PASSO 6: MONTAR A RESPOSTA FINAL
    // ==========================================
    const dashboard = {
      totalFranquias: franquias.length,
      totalFuncionarios: totalFuncionarios,
      salarioMedio: Math.round(salarioMedio * 100) / 100,
      folhaTotal: Math.round(somaSalarios * 100) / 100,
      franquiasPorCidade: cidades,
      funcionariosPorCargo: cargos,
      faixasSalariais: faixasSalariais,
      topFranquias: top5,
      ultimasFranquias: ultimas5Franquias,
      ultimosFuncionarios: ultimos5Funcionarios,
      franquiasSemFuncionarios: franquiasSemFuncionarios,
      funcionariosSemFranquia: funcionariosSemFranquia
    }

    console.log('✅ Dashboard montado com sucesso!')
    return NextResponse.json(dashboard)

  } catch (error) {
    console.error('❌ Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}