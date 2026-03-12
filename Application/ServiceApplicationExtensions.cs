using Application.Services;
using Domain.Ports;
using Infra.Data;
using Infra.Data.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class ServiceApplicationExtensions
{
    public static IServiceCollection AddApplicationService(this IServiceCollection services, string connectionString, IConfiguration configuration)
    {
        services.AddSqlServerService(connectionString);
        services.AddRabbitMQService(configuration);

        services.AddTransient<IPropostaService, PropostaServiceManager>();
        services.AddTransient<IContratacaoService, ContratacaoServiceManager>();

        services.AddScoped<StatusEventService>();

        return services;
    }
}
