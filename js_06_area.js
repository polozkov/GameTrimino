var DRAW = DRAW;
var PAIR = PAIR;
var STAT = STAT;

//области для кнопок и поля на сетке
var AREA = {
    //все элементы в пикселях по размеру сетки ху (в шагах)
    GRID: {
        xy: {},
        ab_total: {},
        board: {},

        new_fig: {},
        help_f1: {},

        score: {},
        new_game: {},

        game_mode: {},
        copm_go: {},

        move_back: {},
        move_forward: {}
    },

    //на сколько пикселей надо обрезать
    CUT: {
        //обрезка каждого поля доски с каждого края
        cell: 0,

        //обрезка шашек игрока на поле
        ball: 0,

        //обрезка фигуры, показывающей возможный ход        
        FIG_FREE: {
            area: 0, //обрезка зоны, куда она вписывается
            r_0_to_1: 0 //радиус (относительный) 
        },

        //обрезка выпавшей фигуры
        FIG_NEW: {
            area: 0,
            r_0_to_1: 0
        }
    },

    //получает клетку (и 2 функции с обрезкой клетки)
    GET_CELL: {
        //100% области клетки на доске в пикселях
        f_100: function (x, y) {
            'use strict';
            //клетка на КВАДРАТНОМ поле
            return PAIR.GRID.f_cell(AREA.GRID.board, x, y, STAT.C.N);
        },

        //получает обрезанную область ячейки
        f_cell: function (x, y) {
            'use strict';
            var temp_area = AREA.GET_CELL.f_100(x, y),
                temp_cut = AREA.CUT.cell;
            return PAIR.CUT.f_same(temp_area, temp_cut);
        },

        //получает обрезанную область мяча
        f_ball: function (x, y) {
            'use strict';
            var temp_area = AREA.GET_CELL.f_100(x, y),
                temp_cut = AREA.CUT.ball;
            return PAIR.CUT.f_same(temp_area, temp_cut);
        }
    },

    //настройка сетки и срезов
    SET: {
        //создай все объекты в GRID
        f_grid: function (wh) {
            'use strict';
            var grid_hori = {
                    xy: PAIR.CREATE.f_xy(6, 4), //общие размеры сетки
                    board: PAIR.CREATE.f_ab_4(0, 0, 4, 4),

                    new_fig: PAIR.CREATE.f_ab_mono(4, 0),
                    new_game: PAIR.CREATE.f_ab_4(5, 0, 6, 0.5),

                    score_all: PAIR.CREATE.f_ab_4(5, 0.5, 6, 1),
                    score_1: PAIR.CREATE.f_ab_4(5, 0.5, 5.5, 1),
                    score_2: PAIR.CREATE.f_ab_4(5.5, 0.5, 6, 1),

                    move_back: PAIR.CREATE.f_ab_4(5, 1, 5.5, 2),
                    move_forward: PAIR.CREATE.f_ab_4(5.5, 1, 6, 2),
                    copm_go: PAIR.CREATE.f_ab_mono(4, 1),
                    game_mode: PAIR.CREATE.f_ab_4(4, 2, 6, 4)
                },
                grid_vert = {
                    xy: PAIR.CREATE.f_xy(4, 6), //общие размеры сетки
                    board: PAIR.CREATE.f_ab_4(0, 0, 4, 4),

                    new_fig: PAIR.CREATE.f_ab_mono(0, 4),
                    new_game: PAIR.CREATE.f_ab_4(1, 4, 2, 4.5),

                    score_all: PAIR.CREATE.f_ab_4(1, 4.5, 2, 5),
                    score_1: PAIR.CREATE.f_ab_4(1, 4.5, 1.5, 5),
                    score_2: PAIR.CREATE.f_ab_4(1.5, 4.5, 2, 5),

                    copm_go: PAIR.CREATE.f_ab_mono(0, 5),
                    move_back: PAIR.CREATE.f_ab_4(1, 5, 1.5, 6),
                    move_forward: PAIR.CREATE.f_ab_4(1.5, 5, 2, 6),
                    game_mode: PAIR.CREATE.f_ab_4(2, 4, 4, 6)
                },

                //зона с настройками области сетки
                grid_now = ((wh.x > wh.y) ? grid_hori : grid_vert),
                //размеры всей области по сетке (копия объекта)
                steps_xy = PAIR.CREATE.f_xy(grid_now.xy.x, grid_now.xy.y),
                //припиши 0,0 к размерам области по сетке
                steps_ab = PAIR.CREATE.f_ab_00(steps_xy),
                //зона из всех пикселей, начиная с точки (0,0)
                area_pixels = PAIR.CREATE.f_ab_00(wh);

            //зона в пикселях лишь по занимаемой области сетки
            function f_by_grid(steps_area) {
                return PAIR.GRID.f_area(area_pixels, steps_area, steps_xy);
            }

            AREA.GRID.xy = steps_xy; //размеры в шагах
            AREA.GRID.ab_total = f_by_grid(steps_ab); //окно в пикселях от (0,0)
            AREA.GRID.board = f_by_grid(grid_now.board); //доска
            
            AREA.GRID.score_1 = f_by_grid(grid_now.score_1); //запас первого
            AREA.GRID.score_2 = f_by_grid(grid_now.score_2); //запас второго
            AREA.GRID.score_all = f_by_grid(grid_now.score_all); //счёт числа ходов

            AREA.GRID.new_fig = f_by_grid(grid_now.new_fig); //новая фигура
            AREA.GRID.new_game = f_by_grid(grid_now.new_game); //новая игра

            AREA.GRID.copm_go = f_by_grid(grid_now.copm_go); //комп, ходи!
            AREA.GRID.move_back = f_by_grid(grid_now.move_back); //ход назад
            AREA.GRID.move_forward = f_by_grid(grid_now.move_forward); //вперёд
            AREA.GRID.game_mode = f_by_grid(grid_now.game_mode); //за кого комп     
        },

        //настрой пиксельные области элементов и срезание фигур
        f_cut_and_grid: function (wh) {
            'use strict';
            AREA.SET.f_grid(wh); //сначала создай все элементы

            var cell_00 = AREA.GET_CELL.f_100(0, 0),
                cell_min_size = PAIR.MATH.f_dxy_min(cell_00),

                new_fig_zone = AREA.GRID.new_fig,
                zone_min_size = PAIR.MATH.f_dxy_min(new_fig_zone);

            AREA.CUT.cell = cell_min_size * 0.04;
            AREA.CUT.ball = cell_min_size * 0.15;

            //доступные ходы (тримино на легальных полях)
            AREA.CUT.FIG_FREE.area = cell_min_size * 0.3;
            //радиус: 100% - это вплотную, 0% - точка
            AREA.CUT.FIG_FREE.r_0_to_1 = 0.7;

            //новая фигура тримино
            AREA.CUT.FIG_NEW.area = zone_min_size * 0.2;
            AREA.CUT.FIG_NEW.r_0_to_1 = 0.7;
        }
    }
};