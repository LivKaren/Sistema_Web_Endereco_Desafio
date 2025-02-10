let enderecos = []; 
let enderecosPorPagina = 2;  
let paginaAtual = 1; 

async function buscarEndereco() {
    const cep = document.getElementById('cep').value;

    if (!cep) {
        alert('Por favor, insira um CEP.');
        return;
    }

    try {
        const response = await fetch(`process.php?cep=${cep}`);
        const data = await response.json();

        if (data.erro) {
            document.getElementById('resultadoEndereco').innerHTML = '<p>CEP inválido.</p>';
        } else {
            document.getElementById('resultadoEndereco').innerHTML = `
                <div class="endereco-buscado">
                    <p><strong>CEP:</strong> ${data.cep}</p>
                    <p><strong>Logradouro:</strong> ${data.logradouro}</p>
                    <p><strong>Bairro:</strong> ${data.bairro}</p>
                    <p><strong>Cidade:</strong> ${data.localidade}</p>
                    <p><strong>Estado:</strong> ${data.uf}</p>
                    <button onclick='armazenarEndereco(${JSON.stringify(data)})'>Salvar Endereço</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao buscar o endereço.');
    }
}

function verificarEnter(event) {
    if (event.key === 'Enter') {
        buscarEndereco();
    }
}

function armazenarEndereco(endereco) {
    fetch('process.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(endereco),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        listarEnderecos(); 
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar o endereço.');
    });
}

function listarEnderecos() {
    fetch('process.php?action=listar')
        .then(response => response.json())
        .then(data => {
            enderecos = data;  
            exibirEnderecos();  
        });
}

function exibirEnderecos() {
    const lista = document.getElementById('listaEnderecos');
    lista.innerHTML = ''; 

    const inicio = (paginaAtual - 1) * enderecosPorPagina;
    const fim = inicio + enderecosPorPagina;
    const enderecosPagina = enderecos.slice(inicio, fim);

    enderecosPagina.forEach(endereco => {
        const li = document.createElement('li');
        li.innerHTML = `
            <p><strong>CEP:</strong> ${endereco.cep}</p>
            <p><strong>Logradouro:</strong> ${endereco.logradouro}</p>
            <p><strong>Bairro:</strong> ${endereco.bairro}</p>
            <p><strong>Cidade:</strong> ${endereco.cidade}</p>
            <p><strong>Estado:</strong> ${endereco.estado}</p>
        `;
        lista.appendChild(li);
    });

    exibirBotoesDeNavegacao();
}

function exibirBotoesDeNavegacao() {
    const totalPaginas = Math.ceil(enderecos.length / enderecosPorPagina);
    const paginacao = document.getElementById('paginacao');
    paginacao.innerHTML = '';

    if (paginaAtual > 1) {
        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = '<';
        btnAnterior.onclick = () => {
            paginaAtual--;
            exibirEnderecos();
        };
        paginacao.appendChild(btnAnterior);
    }

    if (paginaAtual < totalPaginas) {
        const btnProximo = document.createElement('button');
        btnProximo.textContent = '>';
        btnProximo.onclick = () => {
            paginaAtual++;
            exibirEnderecos();
        };
        paginacao.appendChild(btnProximo);
    }
}

function ordenarLista() {
    const criterio = document.getElementById('ordenar').value;
    fetch(`process.php?action=ordenar&campo=${criterio}`)
        .then(response => response.json())
        .then(data => {
            enderecos = data;  
            paginaAtual = 1; 
            exibirEnderecos();  
        });
}

window.onload = listarEnderecos;
