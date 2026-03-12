using Domain.Ports;
using Infra.Data.Adapters;
using Infra.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infra.Data;

public static class ServiceInfraDataExtensions
{

    public static IServiceCollection AddSqlServerService(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<SqlServerContext>(options =>
            options.UseSqlServer(connectionString));
        services.AddScoped<IPropostaRepository, PropostaRepository>();
        services.AddScoped<IContratacaoRepository, ContratacaoRepository>();
        return services;
    }

    /// <summary>
    /// Registra IMessageService: RabbitMQService se "RabbitMQ:Enabled" for true (padrão),
    /// ou NoOpMessageService se false (evita conexão e atrasos na inicialização).
    /// </summary>
    public static IServiceCollection AddRabbitMQService(this IServiceCollection services, IConfiguration configuration)
    {
        var enabled = configuration.GetValue("RabbitMQ:Enabled", true);
        if (enabled)
            services.AddSingleton<IMessageService, RabbitMQService>();
        else
            services.AddSingleton<IMessageService, NoOpMessageService>();
        return services;
    }
}
