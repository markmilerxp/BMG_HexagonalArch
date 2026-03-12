using Domain.Ports;
using Microsoft.Extensions.Logging;

namespace Infra.Data.Adapters;

/// <summary>
/// Implementação vazia de IMessageService quando RabbitMQ está desabilitado (config "RabbitMQ:Enabled": false).
/// Não conecta em nenhum broker e não bloqueia a inicialização da API.
/// </summary>
public class NoOpMessageService : IMessageService
{
    private readonly ILogger<NoOpMessageService> _logger;

    public NoOpMessageService(ILogger<NoOpMessageService> logger)
    {
        _logger = logger;
    }

    public Task PublishAsync<T>(string topic, T message)
    {
        _logger.LogDebug("RabbitMQ desabilitado - mensagem não publicada em {Topic}", topic);
        return Task.CompletedTask;
    }

    public Task SubscribeAsync<T>(string topic, Func<T, Task> handler)
    {
        _logger.LogDebug("RabbitMQ desabilitado - inscrição em {Topic} ignorada", topic);
        return Task.CompletedTask;
    }
}
