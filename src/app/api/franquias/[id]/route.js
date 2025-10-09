import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/franquias/[id] - Buscar franquia por ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id)
    
    const franquia = await prisma.franquia.findUnique({
      where: { id },
      include: {
        funcionarios: true,
        _count: {
          select: { funcionarios: true }
        }
      }
    })

    if (!franquia) {
      return NextResponse.json(
        { error: 'Franquia não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(franquia)
  } catch (error) {
    console.error('Erro ao buscar franquia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/franquias/[id] - Atualizar franquia
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id)
    const data = await request.json()
    
    const { nome, cidade, endereco, telefone } = data

    const franquiaExiste = await prisma.franquia.findUnique({
      where: { id }
    })

    if (!franquiaExiste) {
      return NextResponse.json(
        { error: 'Franquia não encontrada' },
        { status: 404 }
      )
    }

    if (!nome || !cidade || !endereco || !telefone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    const franquia = await prisma.franquia.update({
      where: { id },
      data: {
        nome,
        cidade,
        endereco,
        telefone
      },
      include: {
        funcionarios: true,
        _count: {
          select: { funcionarios: true }
        }
      }
    })

    return NextResponse.json(franquia)
  } catch (error) {
    console.error('Erro ao atualizar franquia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/franquias/[id] - Deletar franquia
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id)

    // Verificar se a franquia existe
    const franquia = await prisma.franquia.findUnique({
      where: { id },
      include: {
        _count: {
          select: { funcionarios: true }
        }
      }
    })

    if (!franquia) {
      return NextResponse.json(
        { error: 'Franquia não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se tem funcionários vinculados
    if (franquia._count.funcionarios > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar franquia com funcionários vinculados' },
        { status: 400 }
      )
    }

    await prisma.franquia.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Franquia deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar franquia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}