using Domain.Entities;

namespace Domain.Ports;

public interface IContratacaoService
{
    Task<IEnumerable<Contratacao>> GetAllContratacoesAsync();
    Task<(Contratacao contratacao, bool jaExistia)> ContratarPropostaAsync(Guid propostaId);
    Task<Proposta?> VerificarStatusPropostaAsync(Guid propostaId);
}
