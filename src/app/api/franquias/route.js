import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/franquias - Listar todas as franquias
export async function GET() {
  try {
    const franquias = await prisma.franquia.findMany({
      include: {
        funcionarios: true,
        _count: {
          select: { funcionarios: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(franquias)
  } catch (error) {
    console.error('Erro ao buscar franquias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/franquias - Criar nova franquia
export async function POST(request) {
  try {
    const data = await request.json()
    
    const { nome, cidade, endereco, telefone } = data

    if (!nome || !cidade || !endereco || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const franquia = await prisma.franquia.create({
      data: {
        nome,
        cidade,
        endereco,
        telefone
      }
    })

    return NextResponse.json(franquia, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar franquia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}