/* 
ideias para melhorar o código
    Rever seletores para tentar tornar o código mais performático
    Usar appendChild em vez de insertBefore, e usar cloneNode para simplificar a criação de novos obstáculos
        Excluir obstáculos depois deles passarem pela tela (talvez criando um id para cada um)

    Rever necessidade de setIntervals e possibilidade de criação de novos Observers
    Rever nomes das variáveis e posição de declaração (para reduzir redeclarações desnecessárias)
    Acessar elementos em JS pelos atributos personalizados, e não pelas classes ou outros seletores

    Usar design patterns como factory e observer para simplificar e desacoplar o projeto
        Diminuir as responsabilidades de cada componente do projeto

    Transformar passaro em objeto com várias propriedades e métodos

    Usar função construtora para gerar novos canos
        
*/

const   jogo = document.querySelector('[wm-flappy]'),
        passaro = document.getElementById('passaro'),
        alturaDoPassaro = passaro.clientHeight,
        posicaoDireitaPassaro = parseFloat(passaro.getBoundingClientRect().right.toFixed(2)),
        posicaoEsquerdaPassaro = parseFloat(passaro.getBoundingClientRect().left.toFixed(2)),
        alturaDaTela = parseFloat(document.body.clientHeight),
        posicaoBaixo = parseFloat(passaro.offsetHeight)

function voar() {
    let alturaAtual = 0
    alturaAtual += parseFloat(passaro.style['top'])

    passaro.style.top = `${alturaAtual - 0.8}vh`
}

function cair() {
    let alturaAtual = 0
    alturaAtual += parseFloat(passaro.style['top'])

    passaro.style.top = `${alturaAtual + 0.5}vh`
}

function derrota() {
    jogo.classList.remove('jogando')
    jogo.classList.add('pausado')
}

function main() {
    window.onkeydown = () => { 
        passaro.classList.remove('caindo')
        passaro.classList.add('voando')
    }
    
    window.onkeyup = () => {
        passaro.classList.remove('voando')
        passaro.classList.add('caindo')
    }

    setInterval( () => {
        if (jogo.classList.contains('jogando')) {

            const posicaoTopoPassaro = parseFloat(passaro.offsetTop)

            // vôo
            if (passaro.classList.contains('voando')) {
                posicaoTopoPassaro >= (0.008 * alturaDaTela) ? voar() : '';
            } else if (
                passaro.classList.contains('caindo') 
                && posicaoTopoPassaro <= alturaDaTela - alturaDoPassaro - (0.005*alturaDaTela)
            ) { cair() } 
            
            else if ( posicaoTopoPassaro > alturaDaTela - alturaDoPassaro - (0.005*alturaDaTela)) {
                derrota()
            }
        }
    }, 10)

    let pontuacaoAtual = 0

    function criarCano() {
        const alturaCano1 = Math.floor(Math.random() * 9) + 1
        const alturaCano2 = 10- alturaCano1

        const novoCano = document.createElement('div')
        novoCano.classList.add('cano')
        novoCano.style.right = '-14vw'
        novoCano.style['grid-template-rows'] = `${alturaCano1}fr 25vh ${alturaCano2}fr` 

        novoCano.innerHTML = 
    `
    <div class="cano1">
        <div class="extensao"></div>
        <div class="boca"></div>
    </div>
    <div class="espaco"></div>
    <div class="cano2">
        <div class="boca"></div>
        <div class="extensao"></div>
    </div>`;

        document.body.insertBefore(novoCano, jogo)

        setInterval(() => {
            if (jogo.classList.contains('jogando')) {
                let posicao = 0
                posicao += parseFloat(novoCano.style.right)
                
                posicao >= 100 ? '' : novoCano.style.right = `${posicao + 0.20}vw`
                
                if(posicao == 50) {
                    pontuacaoAtual++
                    document.getElementById('pontuacao').innerText = pontuacaoAtual
                    document.getElementById('pontuacao-final').innerText = pontuacaoAtual
                }
                    

                const posicaoTopoPassaro = parseFloat(passaro.getBoundingClientRect().top.toFixed(2))
                const posicaoBaixoPassaro = parseFloat(passaro.getBoundingClientRect().bottom.toFixed(2))

                const espaco = novoCano.querySelector('.espaco')
                
                // checar colisão
                const posicaoTopoEspaco = parseFloat(espaco.getBoundingClientRect().top.toFixed(2))
                const posicaoBaixoEspaco = parseFloat(espaco.getBoundingClientRect().bottom.toFixed(2))
                const posicaoEsquerdaEspaco = parseFloat(espaco.getBoundingClientRect().left.toFixed(2))
                const posicaoDireitaEspaco = parseFloat(espaco.getBoundingClientRect().right.toFixed(2))

                const contatoNoY = posicaoTopoPassaro <= posicaoTopoEspaco || posicaoBaixoPassaro >= posicaoBaixoEspaco
                const contatoNoX = posicaoDireitaPassaro >= posicaoEsquerdaEspaco && posicaoDireitaPassaro <= posicaoDireitaEspaco

                if(contatoNoX && contatoNoY) {
                    derrota()
                }
            }
        }, 5)
    }
    
    setInterval(() => {
        if (jogo.classList.contains('jogando')) {criarCano()}}, 1500)

}

window.onkeydown = () => { 
    jogo.onkeydown = ''
    jogo.classList.remove('pausado')
    jogo.classList.add('jogando')
}

// observador de mudança de classes para ativar o fim de jogo
const options = {
    attributes: true
}
  
function callback(mutationList, observer) {
    mutationList.forEach(function(mutation) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (jogo.classList.contains('pausado')) {
            const fim = document.querySelector('.fim')
            const fundoPreto = document.querySelector('.fundo-preto')

            fim.style.display = 'grid'
            fundoPreto.style.display = 'block'

            window.onkeydown = () => {
                jogo.onkeydown = ''
                document.location.reload(true)
            }

        } else if( jogo.classList.contains('jogando')) {
            main()
        }
    }
    })
}
  
const observer = new MutationObserver(callback)
observer.observe(jogo, options)
