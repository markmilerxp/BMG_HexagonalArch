using Application.DTOs;
using Application.Mappers;
using Domain.Entities;
using Domain.Ports;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContratacoesController : ControllerBase
{
    private readonly IContratacaoService _contratacaoService;
    private readonly IPropostaService _propostaService;
    private readonly ILogger<ContratacoesController> _logger;

    public ContratacoesController(IContratacaoService contratacaoService, IPropostaService propostaService, ILogger<ContratacoesController> logger)
    {
        _contratacaoService = contratacaoService;
        _propostaService = propostaService;
        _logger = logger;
    }

    /// <summary>
    /// Todas as propostas com dados de contratação (DataContratacao, NumeroContrato) em uma única chamada — use este para a tela de Contratações.
    /// </summary>
    [HttpGet("propostas")]
    public async Task<IActionResult> GetPropostasComContrato()
    {
        try
        {
            var propostas = await _propostaService.GetAllPropostasAsync();
            var contratacoes = await _contratacaoService.GetAllContratacoesAsync();
            var dictContrato = contratacoes.ToDictionary(c => c.PropostaId);
            var result = propostas.Select(p =>
            {
                var dto = p.ToDto();
                var c = dictContrato.TryGetValue(p.PropostaId, out var contr) ? contr : null;
                return new PropostaComContratoDto
                {
                    PropostaId = dto.PropostaId,
                    ClienteNome = dto.ClienteNome,
                    ValorCobertura = dto.ValorCobertura,
                    Status = dto.Status,
                    DataAtualizacao = dto.DataAtualizacao,
                    DataContratacao = c?.DataContratacao,
                    NumeroContrato = c?.NumeroContrato
                };
            });
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar propostas com contrato");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Listar todas as contratações (PropostaId, DataContratacao, NumeroContrato)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllContratacoes()
    {
        try
        {
            var list = await _contratacaoService.GetAllContratacoesAsync();
            var dtos = list.Select(c => c.ToDto());
            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao listar contratações");
            return StatusCode(500, "Erro interno do servidor");
        }
    }

    /// <summary>
    /// Contratar uma proposta (somente se Aprovada)
    /// </summary>
    /// <param name="dto">Dados da contratação contendo o ID da proposta</param>
    /// <returns>Os dados da contratação realizada com número do contrato gerado</returns>
    /// <remarks>
    /// Realiza a contratação de uma proposta que deve estar com status "Aprovada". Gera automaticamente o número do contrato e atualiza o status para "Contratada".
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> ContratarProposta([FromBody] ContratacaoDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var resultado = await _contratacaoService.ContratarPropostaAsync(dto.PropostaId);
            var contratacao = resultado.contratacao;
            var jaExistia = resultado.jaExistia;
            var mensagem = jaExistia ? "Proposta já contratada" : "Proposta contratada com sucesso";
            
            return Ok(new { 
                contratacao = contratacao.ToDto(jaExistia),
                mensagem = mensagem
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro interno ao contratar proposta {PropostaId}: {Message}", dto.PropostaId, ex.Message);
            return BadRequest(ex.Message);
        }
    }

    /// <summary>
    /// � Verificar status da proposta
    /// </summary>
    /// <remarks>
    /// ## Funcionalidade:
    /// Consulta se uma proposta existe e retorna informações sobre sua disponibilidade.
    /// 
    /// ## Status das Propostas:
    /// 
    /// | Status | Valor | Descrição | Pode Contratar? |
    /// |--------|-------|-----------|-----------------|
    /// | **EmAnalise** | 1 | Proposta em análise | ❌ Não |
    /// | **Aprovada** | 2 | Proposta aprovada | ✅ Sim |
    /// | **Rejeitada** | 3 | Proposta rejeitada | ❌ Não |
    /// | **Contratada** | 4 | Já contratada | ❌ Não |
    /// 
    /// ## Retorno:
    /// - **   Mensagem = "OK", 
    /// - **   Status = "Contratada",
    /// - **   ContratacaoId = contratacao.PropostaId
    /// 
    /// ## Códigos de Resposta:
    /// - **200 OK**: Proposta encontrada
    /// - **404 Not Found**: Proposta não existe
    /// - **500 Internal Server Error**: Erro interno
    /// </remarks>
    [HttpGet("verificar-status/{propostaId:guid}")]
    public async Task<IActionResult> VerificarStatusProposta(Guid propostaId)
    {
        try
        {
            var proposta = await _contratacaoService.VerificarStatusPropostaAsync(propostaId);
            if (proposta == null)
            {
                return NotFound("Proposta não encontrada");
            }

            //// Se a proposta estiver aprovada, contratar ela
            //if (proposta.Status == StatusProposta.Aprovada)
            //{
            //    var contratacao = await _contratacaoService.ContratarPropostaAsync(propostaId);
            //    return Ok(new
            //    {
            //        Mensagem = "OK",
            //        Status = "Contratada",
            //        ContratacaoId = contratacao.PropostaId
            //    });
            //}

            return Ok(new
            {
                Mensagem = "OK",
                Status = (int)proposta.Status
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro interno ao verificar status da proposta {PropostaId}: {Message}", propostaId, ex.Message);
            return StatusCode(500, "Erro interno do servidor");
        }
    }

}