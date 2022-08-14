var PAIR = PAIR;
var window = window;

//константы для игры
var STAT = {
    //числовые константы + массивы (тримино, направления)
    C: {
        //сторона квадратнойго поля
        N: 4,

        //ячеек на квадратном поле
        SQ: 16,

        //число различных игровых фигур тримино
        TRIM_N: 6,

        //столько изначально шашек в запасе игроков
        STORE: 12,

        //тримино для конца игры
        TRIMINO_GAME_OVER: 6,

        //все тримино - это центр 0,0 и ДВЕ соседних клетки
        ARR_TRIMINO: [
            //I вертикальная
            PAIR.CREATE.f_xy_array([[0, 0], [0, 1], [0, -1]]),
            //I горизонтальная
            PAIR.CREATE.f_xy_array([[0, 0], [1, 0], [-1, 0]]),

            //ВПРАВО-ВНИЗ, левый верхний уголок
            PAIR.CREATE.f_xy_array([[0, 0], [1, 0], [0, 1]]),
            //ВЛЕВО-ВВЕРХ, правый нижний уголок
            PAIR.CREATE.f_xy_array([[0, 0], [-1, 0], [0, -1]]),
            //ВЛЕВО-ВНИЗ, правый верхний уголок
            PAIR.CREATE.f_xy_array([[0, 0], [-1, 0], [0, 1]]),
            //ВПРАВО-ВВЕРХ, левый нижний уголок
            PAIR.CREATE.f_xy_array([[0, 0], [1, 0], [0, -1]]),

            //одна фигура (мономино) - конец игры
            PAIR.CREATE.f_xy_array([[0, 0], [0, 0], [0, 0]])
        ],

        //направления вверх - вниз - вправо - влево
        ARR_URDL: [
            PAIR.CREATE.f_xy(0, -1),
            PAIR.CREATE.f_xy(1, 0),
            PAIR.CREATE.f_xy(0, 1),
            PAIR.CREATE.f_xy(-1, 0)
        ],
        
        //пара значений (1,1)
        P_11:  PAIR.CREATE.f_xy(1, 1),
        //пара значений (true, true)
        P_YES_YES: PAIR.CREATE.f_xy(true, true),
        //пара значений (false, false)
        P_NO_NO: PAIR.CREATE.f_xy(false, false)
    },

    //случайные числа
    F: { //случайное целое число, (например номер случайной фигуры)
        f_random_number: function (border_of_integer_interval) {
            'use strict';
            //случайное целое число
            return Math.floor(Math.random() * border_of_integer_interval);
        },

        //номер случайной фигуры (из ШЕСТИ фигур тримино)
        f_random_fig: function () {
            'use strict';
            return Math.floor(Math.random() * STAT.C.TRIM_N);
        }
    },

    //время для анимации
    TIME: {
        //миллисекунд на анимацию одного хода
        move: 600,

        //миллисекунд на анимацию 1 кадра
        step: 30
    },

    //надписи на панелях управления + преобразование массива в строку
    TEXTS: {
        str_comp_go: "Ходи!",
        str_arr_game_mode: [
            "ПАСЬЯНС",
            "С ДРУГОМ",
            "глубина_1",
            "глубина_2"
        ],
        str_move_back: " < ",
        str_move_forward: " > ",
        str_new_fig: "",
        str_new_game: "Заново",
        str_score_move: "Ход №",

        //доска как квадратная матрица
        f_arr_to_str: function (get_board) {
            'use strict';
            var s = '', //
                i;
            for (i = 0; i < STAT.C.SQ; i += 1) {
                //припиши в конец ещё 1 (текущий) элемент
                s = s + get_board[i] + ', ';
                //конец строки? (остаток STAT.C.N - 1), новая строка
                if (((i + 1) % STAT.C.N) === 0) {
                    s = s + '\n';
                }
            }
            return s;
        },

        //несколько досок одновременно (друг за другом через строку)
        f_arr_of_arr_to_str: function (arr_of_arr) {
            'use strict';
            var s = '',
                i;

            for (i = 0; i < arr_of_arr.length; i += 1) {
                s = s + STAT.TEXTS.f_arr_to_str(arr_of_arr[i]) + '\n\n';
            }

            return s;
        },

        //переводит область в строку для вывода
        f_area_to_string: function (ab) {
            'use strict';
            return ('(' + ab.a.x + '; ' + ab.a.y + '; ' + ab.b.x + '; ' + ab.b.y + ')');
        }
    }
};
