using Domain.Entities;
using Domain.Ports;
using Infra.Data.Services;

namespace Application.Services;

public class PropostaServiceManager : IPropostaService
{
    private readonly IPropostaRepository _propostaRepository;
    private readonly IContratacaoRepository _contratacaoRepository;
    private readonly StatusEventService _statusEventService;

    public PropostaServiceManager(IPropostaRepository propostaRepository, IContratacaoRepository contratacaoRepository, StatusEventService statusEventService)
    {
        _propostaRepository = propostaRepository;
        _contratacaoRepository = contratacaoRepository;
        _statusEventService = statusEventService;
    }

    public async Task<IEnumerable<Proposta>> GetAllPropostasAsync()
    {
        return await _propostaRepository.GetAllAsync();
    }

    public async Task<Proposta?> GetPropostaByIdAsync(Guid id)
    {
        return await _propostaRepository.GetByIdAsync(id);
    }

    public async Task<Proposta> CriarPropostaAsync(string clienteNome, decimal valorCobertura)
    {
        var proposta = new Proposta(clienteNome, valorCobertura);
        var propostaCriada = await _propostaRepository.InsertAsync(proposta);

        return propostaCriada;
    }

    public async Task<Proposta> AtualizarStatusPropostaAsync(Guid id, StatusProposta novoStatus)
    {
        var proposta = await _propostaRepository.GetByIdAsync(id);
        if (proposta == null)
        {
            throw new Exception($"Proposta com ID {id} não encontrada");
        }

        // Verificar se já existe contratação (registro em Contratacoes) — nesse caso o status no banco deve ser Contratada
        var contratacaoExistente = await _contratacaoRepository.GetByPropostaIdAsync(id);
        if (contratacaoExistente != null)
        {
            throw new Exception("Não é possível alterar o status de uma proposta já contratada");
        }

        proposta.DefinirStatus(novoStatus);
        var propostaAtualizada = await _propostaRepository.UpdateAsync(proposta);
        return propostaAtualizada;
    }

    public async Task<Proposta> MarcarComoContratadaAsync(Guid id)
    {
        var proposta = await _propostaRepository.GetByIdAsync(id);
        if (proposta == null)
            throw new Exception($"Proposta com ID {id} não encontrada");
        proposta.Contratar();
        return await _propostaRepository.UpdateAsync(proposta);
    }

    public async Task<Proposta> AprovarPropostaAsync(Guid id)
    {
        var proposta = await _propostaRepository.GetByIdAsync(id);
        if (proposta == null)
        {
            throw new Exception($"Proposta com ID {id} não encontrada");
        }

        var statusAnterior = proposta.Status;
        proposta.Aprovar();
        var propostaAprovada = await _propostaRepository.UpdateAsync(proposta);

        await _statusEventService.PublicarMudancaStatusAsync(id, statusAnterior, StatusProposta.Aprovada);

        return propostaAprovada;
    }

    public async Task<bool> ExcluirPropostaAsync(Guid id)
    {
        var proposta = await _propostaRepository.GetByIdAsync(id);
        if (proposta == null) return false;
        var contratacao = await _contratacaoRepository.GetByPropostaIdAsync(id);
        if (contratacao != null)
            throw new Exception("Não é possível excluir proposta já contratada");
        return await _propostaRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<Proposta>> GetPropostasByStatusAsync(StatusProposta status)
    {
        return await _propostaRepository.GetByStatusAsync(status);
    }

}
