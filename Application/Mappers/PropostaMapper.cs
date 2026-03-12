using Application.DTOs;
using Domain.Entities;

namespace Application.Mappers;

public static class PropostaMapper
{
    public static PropostaDto ToDto(this Proposta proposta)
    {
        return new PropostaDto
        {
            PropostaId = proposta.PropostaId,
            ClienteNome = proposta.ClienteNome,
            ValorCobertura = proposta.ValorCobertura,
            Status = (int)proposta.Status,
            DataAtualizacao = proposta.DataAtualizacao
        };
    }

    public static Proposta ToEntity(this CriarPropostaDto dto)
    {
        var proposta = new Proposta(
            dto.ClienteNome,
            dto.ValorCobertura
        );
        return proposta;
    }

    /// <summary>Converte número do enum (1-4) para StatusProposta.</summary>
    public static StatusProposta ToStatusProposta(this int status)
    {
        if (status >= 1 && status <= 4)
            return (StatusProposta)status;
        throw new ArgumentException($"Status inválido: {status}. Use 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada.");
    }
}
