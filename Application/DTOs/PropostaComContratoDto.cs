namespace Application.DTOs;

/// <summary>Proposta com dados da contratação quando existir (para tela de Contratações em uma única chamada).</summary>
public class PropostaComContratoDto
{
    public Guid PropostaId { get; set; }
    public string ClienteNome { get; set; } = string.Empty;
    public decimal ValorCobertura { get; set; }
    /// <summary>Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada.</summary>
    public int Status { get; set; }
    public DateTime? DataAtualizacao { get; set; }
    public DateTime? DataContratacao { get; set; }
    public string? NumeroContrato { get; set; }
}
