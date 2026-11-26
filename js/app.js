let listaProdutos = [];
let listaFrases = [];
let sacola = [];
let produtoEmEdicao = null;
let entregaDentroDoRaio = true;

function verificarLojaAberta() {
    const agora = new Date();
    const diaSemana = agora.getDay();
    const hora = agora.getHours();

    if (diaSemana === 1) {
        return false;
    }

    if (diaSemana >= 2 && diaSemana <= 4) {
        return hora >= 18 && hora < 23;
    }

    return hora >= 18 && hora <= 23;
}

document.addEventListener("DOMContentLoaded", () => {
    const avisoFechado = document.getElementById("avisoForaHorario");
    if (avisoFechado && !verificarLojaAberta()) {
        avisoFechado.classList.remove("oculto");
    }

    const grade = document.getElementById("gradeProdutos");
    if (grade) {
        fetch("data/cardapio.json")
            .then(resposta => resposta.json())
            .then(dados => {
                listaProdutos = dados;
                mostrarProdutos(listaProdutos);
            })
            .catch(erro => console.error("Erro ao carregar o cardápio:", erro));
    }

    const gradeDestaques = document.getElementById("gradeDestaques");
    if (gradeDestaques) {
        fetch("data/destaques.json")
            .then(resposta => resposta.json())
            .then(dados => {
                mostrarDestaques(dados);
            })
            .catch(erro => console.error("Erro ao carregar destaques:", erro));
    }

    const formularioContato = document.getElementById("formularioContato");
    if (formularioContato) {
        formularioContato.addEventListener("submit", (evento) => {
            evento.preventDefault();
            document.getElementById("retornoContato").classList.remove("oculto");
            formularioContato.reset();
        });
    }

    const formularioCheckout = document.getElementById("formularioCheckout");
    if (formularioCheckout) {
        carregarDadosSalvos();
        formularioCheckout.addEventListener("submit", validarEFinalizarCompra);
    }

    ativarFrasesAleatorias();
});

function mostrarDestaques(itens) {
    const grade = document.getElementById("gradeDestaques");
    grade.innerHTML = "";

    itens.forEach(item => {
        const blocoValor = item.ehCupom
            ? `<div class="caixaCupom">${item.destaque}</div>`
            : `<div class="valorDestaque">${item.destaque}</div>`;

        const botaoAcao = item.ehCupom
            ? `<button class="btn botaoAmarelo botaoLargo" onclick="copiarCupom('${item.acao}', this)"><i class="bi bi-clipboard-check"></i> ${item.textoBotao}</button>`
            : `<a href="${item.acao}" class="btn botaoVermelho botaoLargo"><i class="bi bi-fire"></i> ${item.textoBotao}</a>`;

        grade.innerHTML += `
            <div class="col-12 col-md-6 col-lg-3">
                <div class="cartaoDestaque">
                    <div class="topoCartaoDestaque">
                        <span class="badge etiquetaVermelha">${item.tipo}</span>
                        <i class="bi ${item.icone} iconeDestaque"></i>
                    </div>
                    <h5 class="tituloDestaque">${item.titulo}</h5>
                    <p class="descricaoDestaque">${item.descricao}</p>
                    ${blocoValor}
                    ${botaoAcao}
                </div>
            </div>
        `;
    });
}

function copiarCupom(codigo, botao) {
    navigator.clipboard.writeText(codigo);
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = `<i class="bi bi-check2-all"></i> Cupom Copiado!`;
    setTimeout(() => {
        botao.innerHTML = textoOriginal;
    }, 2500);
}

function ativarFrasesAleatorias() {
    const caixaToast = document.getElementById("caixaFrase");
    if (!caixaToast) return;

    fetch("data/frases.json")
        .then(resposta => resposta.json())
        .then(dados => {
            listaFrases = dados;
            setInterval(() => {
                exibirNovaFrase(caixaToast);
            }, 30000);
        })
        .catch(erro => console.error("Erro ao carregar frases:", erro));
}

function exibirNovaFrase(caixaToast) {
    if (listaFrases.length === 0) return;

    const sorteio = Math.floor(Math.random() * listaFrases.length);
    document.getElementById("mensagemAlerta").textContent = listaFrases[sorteio];

    const aviso = bootstrap.Toast.getOrCreateInstance(caixaToast, { delay: 7000 });
    aviso.show();
}

function mostrarProdutos(itens) {
    const grade = document.getElementById("gradeProdutos");
    const lojaAberta = verificarLojaAberta();
    grade.innerHTML = "";

    itens.forEach(produto => {
        const valorFormatado = produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        const botaoAdicionar = lojaAberta
            ? `<button class="btn botaoVermelho btn-sm" onclick="abrirModalAdicionais(${produto.id})"><i class="bi bi-plus-lg"></i> Adicionar</button>`
            : `<button class="btn botaoDesativado btn-sm" disabled><i class="bi bi-lock-fill"></i> Fechado</button>`;
        
        grade.innerHTML += `
            <div class="col-12 col-md-6 col-lg-4">
                <div class="card itemCardapio">
                    <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                    <div class="card-body corpoItemCardapio">
                        <div class="cabecalhoItemCardapio">
                            <h5 class="nomeItemCardapio">${produto.nome}</h5>
                            <span class="badge etiquetaVermelha">${produto.categoria}</span>
                        </div>
                        <p class="descricaoItemCardapio">${produto.descricao}</p>
                        <div class="rodapeItemCardapio">
                            <span class="precoItemCardapio">${valorFormatado}</span>
                            ${botaoAdicionar}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

function mudarCategoria(categoriaEscolhida, botao) {
    document.querySelectorAll(".botaoCategoria").forEach(item => item.classList.remove("ativo"));
    botao.classList.add("ativo");

    if (categoriaEscolhida === "Todos") {
        mostrarProdutos(listaProdutos);
    } else {
        const filtrados = listaProdutos.filter(produto => produto.categoria === categoriaEscolhida);
        mostrarProdutos(filtrados);
    }
}

function abrirModalAdicionais(idProduto) {
    if (!verificarLojaAberta()) {
        alert("Estamos fechados no momento! Nosso horário é de Terça a Quinta (18h às 23h) e Sexta a Domingo (18h às 00h).");
        return;
    }

    produtoEmEdicao = listaProdutos.find(produto => produto.id === idProduto);
    if (!produtoEmEdicao) return;

    document.getElementById("tituloItemModal").textContent = produtoEmEdicao.nome;
    document.getElementById("descricaoItemModal").textContent = produtoEmEdicao.descricao;
    document.getElementById("campoObservacao").value = "";

    document.querySelectorAll(".opcaoExtra").forEach(caixa => {
        caixa.checked = false;
    });

    const areaExtras = document.getElementById("areaOpcoesExtras");
    if (produtoEmEdicao.categoria === "Bebidas") {
        areaExtras.classList.add("oculto");
    } else {
        areaExtras.classList.remove("oculto");
    }

    recalcularTotalModal();

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalAdicionais"));
    modal.show();
}

function recalcularTotalModal() {
    if (!produtoEmEdicao) return;

    let totalItem = produtoEmEdicao.preco;
    document.querySelectorAll(".opcaoExtra:checked").forEach(caixa => {
        totalItem += parseFloat(caixa.dataset.preco);
    });

    document.getElementById("precoItemModal").textContent = totalItem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function confirmarAdicaoSacola() {
    if (!produtoEmEdicao) return;

    let extrasSelecionados = [];
    let somaExtras = 0;

    document.querySelectorAll(".opcaoExtra:checked").forEach(caixa => {
        extrasSelecionados.push(caixa.value);
        somaExtras += parseFloat(caixa.dataset.preco);
    });

    const observacaoTexto = document.getElementById("campoObservacao").value.trim();

    sacola.push({
        id: produtoEmEdicao.id,
        nome: produtoEmEdicao.nome,
        precoFinal: produtoEmEdicao.preco + somaExtras,
        adicionais: extrasSelecionados,
        observacao: observacaoTexto
    });

    atualizarSacola();

    const modalEl = document.getElementById("modalAdicionais");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
}

function atualizarSacola() {
    const listaHtml = document.getElementById("listaSacola");
    const contador = document.getElementById("qtdCarrinho");
    const campoTotal = document.getElementById("valorTotal");

    contador.textContent = sacola.length;
    listaHtml.innerHTML = "";

    let soma = 0;

    sacola.forEach((item, posicao) => {
        soma += item.precoFinal;

        const textoExtras = item.adicionais.length > 0
            ? `<div class="textoInformacao">+ ${item.adicionais.join(", ")}</div>`
            : "";

        const textoObs = item.observacao
            ? `<div class="textoObservacao">Obs: ${item.observacao}</div>`
            : "";

        listaHtml.innerHTML += `
            <li class="itemSacola">
                <div>
                    <span class="fw-semibold">${item.nome}</span>
                    ${textoExtras}
                    ${textoObs}
                    <div class="precoItemSacola">${item.precoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="tirarDaSacola(${posicao})">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    });

    if (sacola.length === 0) {
        listaHtml.innerHTML = '<li class="sacolaVazia">Seu carrinho está vazio.</li>';
    }

    campoTotal.textContent = soma.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function tirarDaSacola(posicao) {
    sacola.splice(posicao, 1);
    atualizarSacola();
}

function abrirFechamentoPedido() {
    if (!verificarLojaAberta()) {
        alert("Estamos fechados no momento! Não é possível finalizar pedidos fora do horário de funcionamento.");
        return;
    }

    if (sacola.length === 0) {
        alert("Adicione pelo menos um item ao pedido antes de finalizar!");
        return;
    }

    const abaCarrinhoEl = document.getElementById("abaCarrinho");
    const abaCarrinho = bootstrap.Offcanvas.getInstance(abaCarrinhoEl);
    if (abaCarrinho) {
        abaCarrinho.hide();
    }

    document.getElementById("telaFormularioCheckout").classList.remove("oculto");
    document.getElementById("telaSucessoCheckout").classList.add("oculto");
    document.getElementById("erroValidacao").classList.add("oculto");

    atualizarResumoCheckout();

    const modalCheckout = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFechamento"));
    modalCheckout.show();
}

function mascaraEBuscaCep(campo) {
    let numeros = campo.value.replace(/\D/g, "");
    if (numeros.length > 5) {
        campo.value = numeros.slice(0, 5) + "-" + numeros.slice(5, 8);
    } else {
        campo.value = numeros;
    }

    if (numeros.length === 8) {
        consultarCep(numeros);
    }
}

function consultarCep(cepLimpo) {
    const statusCep = document.getElementById("statusCep");
    const alertaDistancia = document.getElementById("alertaDistanciaEntrega");

    statusCep.textContent = "Buscando CEP...";
    statusCep.className = "badge bg-warning text-dark";

    fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(resposta => resposta.json())
        .then(dados => {
            if (dados.erro) {
                statusCep.textContent = "CEP não encontrado";
                statusCep.className = "badge bg-danger";
                entregaDentroDoRaio = false;
                alertaDistancia.className = "mensagemDistanciaErro";
                alertaDistancia.innerHTML = `<i class="bi bi-x-circle-fill"></i> CEP inválido. Confira os números digitados.`;
                alertaDistancia.classList.remove("oculto");
                return;
            }

            if (dados.logradouro) document.getElementById("endRua").value = dados.logradouro;
            if (dados.bairro) document.getElementById("endBairro").value = dados.bairro;
            document.getElementById("endCidade").value = `${dados.localidade} - ${dados.uf}`;

            const cidadeNormalizada = dados.localidade.toLowerCase();
            const prefixoCep = parseInt(cepLimpo.slice(0, 5));

            if (cidadeNormalizada === "são francisco de itabapoana" || (prefixoCep >= 28230 && prefixoCep <= 28239)) {
                entregaDentroDoRaio = true;
                statusCep.textContent = "Área atendida!";
                statusCep.className = "badge bg-success";

                const ehBarraSeca = (dados.bairro || "").toLowerCase().includes("barra seca");
                alertaDistancia.className = "mensagemDistanciaSucesso";
                alertaDistancia.innerHTML = ehBarraSeca
                    ? `<i class="bi bi-check-circle-fill"></i> Perfeito! Você está em Barra Seca, bem pertinho da nossa chapa (tempo médio: 25 a 35 min).`
                    : `<i class="bi bi-check-circle-fill"></i> Entregamos em ${dados.localidade} - ${dados.uf}! Agora digite apenas o número e ponto de referência.`;
                alertaDistancia.classList.remove("oculto");
                document.getElementById("endNumero").focus();
            } else {
                entregaDentroDoRaio = false;
                statusCep.textContent = "Fora do raio de entrega";
                statusCep.className = "badge bg-danger";
                alertaDistancia.className = "mensagemDistanciaErro";
                alertaDistancia.innerHTML = `<i class="bi bi-exclamation-triangle-fill"></i> Endereço em <strong>${dados.localidade} - ${dados.uf}</strong> está fora da nossa área de delivery (atendemos apenas São Francisco de Itabapoana - RJ). Você pode escolher <strong>Retirar na Loja</strong>.`;
                alertaDistancia.classList.remove("oculto");
            }
        })
        .catch(() => {
            statusCep.textContent = "Falha na consulta";
            statusCep.className = "badge bg-secondary";
        });
}

function alternarModoEntrega() {
    const ehEntrega = document.getElementById("opcaoEntrega").checked;
    const blocoEndereco = document.getElementById("blocoEnderecoEntrega");
    const blocoRetirada = document.getElementById("blocoInfoRetirada");

    if (ehEntrega) {
        blocoEndereco.classList.remove("oculto");
        blocoRetirada.classList.add("oculto");
    } else {
        blocoEndereco.classList.add("oculto");
        blocoRetirada.classList.remove("oculto");
    }
}

function verificarTroco() {
    const forma = document.getElementById("formaPagamento").value;
    const caixaTroco = document.getElementById("campoTrocoBox");

    if (forma === "Dinheiro") {
        caixaTroco.classList.remove("oculto");
    } else {
        caixaTroco.classList.add("oculto");
    }
}

function calcularTotalComDesconto() {
    let total = sacola.reduce((acumulador, item) => acumulador + item.precoFinal, 0);
    const cupom = document.getElementById("cupomDesconto").value.trim().toUpperCase();

    if (cupom === "DUVIDA15") {
        total = total * 0.85;
    }
    return total;
}

function atualizarResumoCheckout() {
    const total = calcularTotalComDesconto();
    document.getElementById("totalFinalCheckout").textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function carregarDadosSalvos() {
    const dadosGuardados = localStorage.getItem("anBurgueriaCliente");
    if (!dadosGuardados) return;

    const dados = JSON.parse(dadosGuardados);
    if (dados.nome) document.getElementById("clienteNome").value = dados.nome;
    if (dados.telefone) document.getElementById("clienteTelefone").value = dados.telefone;
    if (dados.cep) {
        document.getElementById("endCep").value = dados.cep;
        const apenasNumeros = dados.cep.replace(/\D/g, "");
        if (apenasNumeros.length === 8) {
            consultarCep(apenasNumeros);
        }
    }
    if (dados.rua) document.getElementById("endRua").value = dados.rua;
    if (dados.bairro) document.getElementById("endBairro").value = dados.bairro;
    if (dados.cidade) document.getElementById("endCidade").value = dados.cidade;
    if (dados.numero) document.getElementById("endNumero").value = dados.numero;
    if (dados.referencia) document.getElementById("endReferencia").value = dados.referencia;
}

function limparDadosSalvos() {
    localStorage.removeItem("anBurgueriaCliente");
    document.getElementById("clienteNome").value = "";
    document.getElementById("clienteTelefone").value = "";
    document.getElementById("endCep").value = "";
    document.getElementById("endRua").value = "";
    document.getElementById("endBairro").value = "";
    document.getElementById("endCidade").value = "";
    document.getElementById("endNumero").value = "";
    document.getElementById("endReferencia").value = "";
    document.getElementById("alertaDistanciaEntrega").classList.add("oculto");

    const statusCep = document.getElementById("statusCep");
    statusCep.textContent = "Raio: São Francisco de Itabapoana";
    statusCep.className = "badge bg-secondary";
}

function validarEFinalizarCompra(evento) {
    evento.preventDefault();

    if (!verificarLojaAberta()) {
        mostrarErroCheckout("Estamos fechados no momento! Não é possível concluir pedidos fora do horário de funcionamento.");
        return;
    }

    const caixaErro = document.getElementById("erroValidacao");
    caixaErro.classList.add("oculto");

    const nome = document.getElementById("clienteNome").value.trim();
    const telefone = document.getElementById("clienteTelefone").value.trim();
    const ehEntrega = document.getElementById("opcaoEntrega").checked;
    const cep = document.getElementById("endCep").value.trim();
    const rua = document.getElementById("endRua").value.trim();
    const bairro = document.getElementById("endBairro").value.trim();
    const cidade = document.getElementById("endCidade").value.trim();
    const numero = document.getElementById("endNumero").value.trim();
    const referencia = document.getElementById("endReferencia").value.trim();
    const pagamento = document.getElementById("formaPagamento").value;
    const troco = document.getElementById("valorTroco").value.trim();

    if (!nome || !telefone) {
        mostrarErroCheckout("Por favor, preencha seu nome e telefone para contato.");
        return;
    }

    if (ehEntrega) {
        if (cep.replace(/\D/g, "").length !== 8) {
            mostrarErroCheckout("Digite um CEP válido com 8 dígitos.");
            return;
        }
        if (!entregaDentroDoRaio) {
            mostrarErroCheckout("Este CEP está fora da nossa área de entrega (atendemos apenas São Francisco de Itabapoana - RJ). Selecione 'Retirar na Loja' ou altere o CEP.");
            return;
        }
        if (!rua || !bairro || !numero) {
            mostrarErroCheckout("Preencha o Número da residência (e confira Rua e Bairro).");
            return;
        }
    }

    if (!pagamento) {
        mostrarErroCheckout("Selecione uma forma de pagamento.");
        return;
    }

    if (pagamento === "Dinheiro" && !troco) {
        mostrarErroCheckout("Informe para quanto precisa de troco (ou digite 'Sem troco').");
        return;
    }

    localStorage.setItem("anBurgueriaCliente", JSON.stringify({
        nome,
        telefone,
        cep,
        rua,
        bairro,
        cidade,
        numero,
        referencia
    }));

    const totalFinal = calcularTotalComDesconto().toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    document.getElementById("resumoClienteConfirmado").textContent =
        `Obrigado, ${nome}! Seu pedido no valor de ${totalFinal} (${pagamento}) já entrou em preparação.`;

    document.getElementById("detalhesEntregaConfirmada").textContent = ehEntrega
        ? `Entrega em: ${rua}, ${numero} - ${bairro} (${cidade}) | CEP: ${cep} ${referencia ? "| Ref: " + referencia : ""}`
        : `Modalidade: Retirada no balcão (R. da Dúvida - Barra Seca, São Francisco de Itabapoana - RJ)`;

    document.getElementById("telaFormularioCheckout").classList.add("oculto");
    document.getElementById("telaSucessoCheckout").classList.remove("oculto");

    sacola = [];
    atualizarSacola();
}

function mostrarErroCheckout(mensagem) {
    const caixaErro = document.getElementById("erroValidacao");
    caixaErro.textContent = mensagem;
    caixaErro.classList.remove("oculto");
}
