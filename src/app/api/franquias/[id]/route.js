import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_req, { params }) {
  try {
    const id = Number(params?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const franquia = await prisma.franquia.findUnique({
      where: { id },
      include: {
        funcionarios: true,
        _count: { select: { funcionarios: true } }
      }
    })

    if (!franquia) {
      return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 })
    }

    return NextResponse.json(franquia)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = Number(params?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const data = await request.json()
    const { nome, cep, cidade, endereco, telefone } = data ?? {}

    if (!nome || !cep || !cidade || !endereco || !telefone) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const cepLimpo = String(cep).replace(/\D/g, '')
    if (!/^\d{8}$/.test(cepLimpo)) {
      return NextResponse.json({ error: 'CEP deve conter 8 dígitos' }, { status: 400 })
    }

    const franquiaExiste = await prisma.franquia.findUnique({ where: { id } })
    if (!franquiaExiste) {
      return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 })
    }

    const franquia = await prisma.franquia.update({
      where: { id },
      data: { nome, cep: cepLimpo, cidade, endereco, telefone },
      include: {
        funcionarios: true,
        _count: { select: { funcionarios: true } }
      }
    })

    return NextResponse.json(franquia)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  try {
    const id = Number(params?.id)
    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const franquia = await prisma.franquia.findUnique({
      where: { id },
      include: { _count: { select: { funcionarios: true } } }
    })

    if (!franquia) {
      return NextResponse.json({ error: 'Franquia não encontrada' }, { status: 404 })
    }

    if (franquia._count.funcionarios > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar franquia com funcionários vinculados' },
        { status: 400 }
      )
    }

    await prisma.franquia.delete({ where: { id } })
    return NextResponse.json({ message: 'Franquia deletada com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
