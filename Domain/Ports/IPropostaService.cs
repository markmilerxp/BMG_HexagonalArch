using Domain.Entities;

namespace Domain.Ports;

public interface IPropostaService
{
    Task<IEnumerable<Proposta>> GetAllPropostasAsync();
    Task<Proposta?> GetPropostaByIdAsync(Guid id);
    Task<Proposta> CriarPropostaAsync(string clienteNome, decimal valorCobertura);
    Task<Proposta> AtualizarStatusPropostaAsync(Guid id, StatusProposta novoStatus);
    /// <summary>Atualiza nome, valor e status da proposta; DataAtualizacao é definida automaticamente.</summary>
    Task<Proposta> AtualizarPropostaAsync(Guid id, string clienteNome, decimal valorCobertura, StatusProposta novoStatus);
    /// <summary>Marca a proposta como Contratada (usado no fluxo de contratação).</summary>
    Task<Proposta> MarcarComoContratadaAsync(Guid id);
    Task<bool> ExcluirPropostaAsync(Guid id);
    Task<IEnumerable<Proposta>> GetPropostasByStatusAsync(StatusProposta status);
}
