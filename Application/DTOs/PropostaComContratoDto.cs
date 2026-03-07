namespace Application.DTOs;

/// <summary>Proposta com dados da contratação quando existir (para tela de Contratações em uma única chamada).</summary>
public class PropostaComContratoDto
{
    public Guid PropostaId { get; set; }
    public string ClienteNome { get; set; } = string.Empty;
    public decimal ValorCobertura { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? DataAtualizacao { get; set; }
    public DateTime? DataContratacao { get; set; }
    public string? NumeroContrato { get; set; }
}
