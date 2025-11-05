import { NextResponse } from "next/server";

export async function GET(request, {params}){

    try{
        const cep = params.cep.replace(/\D/g,'')

        if(cep.length !== 8){
            return NextResponse.json(
                {error: 'O campo CEP deve conter 8 dígitos'},
                {status: 400}
            )
        }
        

const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
const data = await response.json()

if (data.erro){
return NextResponse.json(
    {error: 'CEP não encontrado'},
    {status: 404}
)
}

return NextResponse.json(
    {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
        estado: data.estado
    })

    }catch (error){
        console.error('Foi Encontrado um erro a buscar o CEP', error)
        return NextResponse.json(
            {error: 'Foi encontrado um erro ao consultar o CEP'},
            {}
        )
    }
}