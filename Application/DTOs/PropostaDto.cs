namespace Application.DTOs
{
    /// <summary>Status como número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada.</summary>
    public class StatusPropostaDto
    {
        public int Status { get; set; }
    }

    public class PropostaDto
    {
        public Guid PropostaId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public decimal ValorCobertura { get; set; }
        /// <summary>Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada.</summary>
        public int Status { get; set; }
        public DateTime? DataAtualizacao { get; set; }
    }

    public class CriarPropostaDto
    {
        public string ClienteNome { get; set; } = string.Empty;
        public decimal ValorCobertura { get; set; }
    }

    /// <summary>Status como número do enum (1-4).</summary>
    public class AtualizarStatusPropostaDto
    {
        public int Status { get; set; }
    }

    /// <summary>Atualiza proposta (nome, valor, status). A data é atualizada automaticamente no servidor. Status = número do enum (1-4).</summary>
    public class AtualizarPropostaDto
    {
        public string ClienteNome { get; set; } = string.Empty;
        public decimal ValorCobertura { get; set; }
        /// <summary>Número do enum: 1=EmAnalise, 2=Aprovada, 3=Rejeitada, 4=Contratada.</summary>
        public int Status { get; set; }
    }
}
